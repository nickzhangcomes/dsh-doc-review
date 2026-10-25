/**
 * Which reply is open as a document, plus the per-reply document cache.
 * Opening a reply reads its Markdown from the chat projection.
 */
import { DocStore } from './store.ts'

/* eslint-disable @typescript-eslint/no-explicit-any -- runtime services are untyped */

export interface OpenDoc {
  readonly sessionId: string
  readonly messageId: string
  readonly store: DocStore
}

const docs = new Map<string, DocStore>()

export function existingDoc(messageId: string): DocStore | undefined {
  return docs.get(messageId)
}

/** Markdown of an assistant reply, joined across its text-bearing steps. */
export function replyMarkdown(uiConversation: any, sessionId: string, messageId: string): string | null {
  try {
    const snap = uiConversation.binding(sessionId).target('chat').getSnapshot()
    const parts: string[] = []
    for (const k of snap?.order ?? []) {
      const n = snap.nodes.get(k)
      if (n?.kind !== 'assistant-step' || n.data?.finalNode?.messageId !== messageId) continue
      const blocks: any[] = Array.isArray(n.data?.blocks) ? n.data.blocks : []
      const t = blocks.filter((b) => b && b.kind === 'text' && typeof b.text === 'string').map((b) => b.text).join('\n')
      if (t.trim()) parts.push(t)
    }
    return parts.length ? parts.join('\n\n') : null
  } catch {
    return null
  }
}

export function sessionTitle(sessions: any, sessionId: string): string {
  try {
    const row = sessions.list.getSnapshot().byId[sessionId]
    return String(row?.displayTitle ?? row?.projectionValues?.title ?? '') || '对话'
  } catch {
    return '对话'
  }
}

class ViewStore {
  private current: OpenDoc | null = null
  private readonly listeners = new Set<() => void>()

  getSnapshot = (): OpenDoc | null => this.current

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  open(deps: { sessions: any; uiConversation: any }, sessionId: string, messageId: string): boolean {
    const markdown = replyMarkdown(deps.uiConversation, sessionId, messageId)
    if (markdown === null) return false
    let store = docs.get(messageId)
    if (!store || store.getSnapshot().original !== markdown) {
      store = new DocStore({ sessionId, messageId, title: sessionTitle(deps.sessions, sessionId), markdown })
      docs.set(messageId, store)
    }
    this.current = { sessionId, messageId, store }
    this.emit()
    return true
  }

  close(): void {
    this.current = null
    this.emit()
  }

  private emit(): void {
    for (const fn of this.listeners) fn()
  }
}

export const docView = new ViewStore()

/** Subscribers to document changes of any reply (for the badge under replies). */
export function docFor(deps: { sessions: any; uiConversation: any }, sessionId: string, messageId: string): DocStore | undefined {
  const cached = docs.get(messageId)
  if (cached) return cached
  try {
    if (!window.localStorage.getItem('dsh-review:doc:v1:' + messageId)) return undefined
  } catch {
    return undefined
  }
  const markdown = replyMarkdown(deps.uiConversation, sessionId, messageId)
  if (markdown === null) return undefined
  const store = new DocStore({ sessionId, messageId, title: sessionTitle(deps.sessions, sessionId), markdown })
  docs.set(messageId, store)
  return store
}
