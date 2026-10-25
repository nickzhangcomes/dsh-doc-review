/**
 * Document-mode state: one reading document per assistant reply (keyed by
 * its message id) holding the working copy of the Markdown, strong-approval
 * highlights and comment threads. Persisted to localStorage so re-entering
 * the document finds everything where it was left.
 */
import { plainOf, shorten, type Anchor } from './anchor.ts'

export type Role = 'user' | 'agent'

export interface Msg {
  readonly id: number
  readonly role: Role
  readonly text: string
  /** Agent messages only: pending → streaming → done | error. */
  readonly status?: 'pending' | 'streaming' | 'done' | 'error'
}

export interface Edit {
  readonly find: string
  readonly replace: string
  /** Offset in the Markdown where `replace` was spliced in. */
  readonly at: number
  readonly status: 'applied' | 'undone' | 'failed'
}

export interface Thread {
  readonly id: number
  readonly anchor: Anchor | null
  readonly quote: string
  /** Created but no message sent yet: discarded on cancel / exit. */
  readonly draft: boolean
  readonly askOn: boolean
  readonly messages: readonly Msg[]
  readonly input: string
  readonly resolved: boolean
  readonly edit: Edit | null
}

export interface Mark {
  readonly id: number
  readonly anchor: Anchor
}

export interface DocState {
  readonly sessionId: string
  readonly messageId: string
  readonly title: string
  readonly original: string
  readonly markdown: string
  /** Bumped on every Markdown change (the agent is re-sent the doc when it moved). */
  readonly version: number
  readonly highlights: readonly Mark[]
  readonly threads: readonly Thread[]
  readonly nextId: number
}

const KEY = (messageId: string): string => 'dsh-review:doc:v1:' + messageId
const AGENT_DEFAULT_KEY = 'dsh-review:agent-default'

export function agentDefault(): boolean {
  try {
    return window.localStorage.getItem(AGENT_DEFAULT_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setAgentDefault(on: boolean): void {
  try {
    window.localStorage.setItem(AGENT_DEFAULT_KEY, on ? 'on' : 'off')
  } catch {
    /* best effort */
  }
}

export class DocStore {
  private state: DocState
  private readonly listeners = new Set<() => void>()

  constructor(init: { sessionId: string; messageId: string; title: string; markdown: string }) {
    let state: DocState = {
      sessionId: init.sessionId,
      messageId: init.messageId,
      title: init.title,
      original: init.markdown,
      markdown: init.markdown,
      version: 0,
      highlights: [],
      threads: [],
      nextId: 1,
    }
    try {
      const raw = window.localStorage.getItem(KEY(init.messageId))
      if (raw) {
        const saved = JSON.parse(raw) as DocState
        /* A regenerated reply invalidates the saved copy. */
        if (saved && saved.original === init.markdown && Array.isArray(saved.threads)) {
          state = {
            ...saved,
            sessionId: init.sessionId,
            title: init.title,
            /* An agent turn cut off by a reload never resumes. */
            threads: saved.threads.map((t) => ({
              ...t,
              messages: t.messages.map((m: Msg) =>
                m.status === 'pending' || m.status === 'streaming' ? { ...m, status: 'error' as const, text: m.text || '（回复已中断）' } : m,
              ),
            })),
          }
        }
      }
    } catch {
      /* corrupt storage: start fresh */
    }
    this.state = state
  }

  getSnapshot = (): DocState => this.state

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  update(fn: (s: DocState) => DocState): void {
    this.state = fn(this.state)
    try {
      const persisted = { ...this.state, threads: this.state.threads.filter((t) => !t.draft) }
      window.localStorage.setItem(KEY(this.state.messageId), JSON.stringify(persisted))
    } catch {
      /* best effort */
    }
    for (const fn2 of this.listeners) fn2()
  }

  thread(id: number): Thread | undefined {
    return this.state.threads.find((t) => t.id === id)
  }

  patchThread(id: number, fn: (t: Thread) => Thread): void {
    this.update((s) => ({ ...s, threads: s.threads.map((t) => (t.id === id ? fn(t) : t)) }))
  }

  /** Reserve an id. */
  allocate(): number {
    const id = this.state.nextId
    this.update((s) => ({ ...s, nextId: s.nextId + 1 }))
    return id
  }

  addHighlight(anchor: Anchor): void {
    const id = this.allocate()
    this.update((s) => ({ ...s, highlights: [...s.highlights, { id, anchor }] }))
  }

  removeHighlights(ids: readonly number[]): void {
    this.update((s) => ({ ...s, highlights: s.highlights.filter((h) => !ids.includes(h.id)) }))
  }

  createThread(anchor: Anchor): number {
    const id = this.allocate()
    const thread: Thread = { id, anchor, quote: anchor.quote, draft: true, askOn: agentDefault(), messages: [], input: '', resolved: false, edit: null }
    this.update((s) => ({ ...s, threads: [...s.threads, thread] }))
    return id
  }

  dropDrafts(): void {
    if (this.state.threads.some((t) => t.draft)) this.update((s) => ({ ...s, threads: s.threads.filter((t) => !t.draft) }))
  }

  setMarkdown(markdown: string): void {
    this.update((s) => ({ ...s, markdown, version: s.version + 1 }))
  }
}

/* ---------- edits ---------- */

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Splice `replace` in for `find`; tolerant of whitespace differences. */
export function applyEdit(md: string, find: string, replace: string): { md: string; at: number; find: string } | null {
  if (!find) return null
  let at = md.indexOf(find)
  let matched = find
  if (at < 0) {
    const re = new RegExp(escapeRe(find.trim()).replace(/\s+/g, '\\s+'))
    const m = re.exec(md)
    if (!m) return null
    at = m.index
    matched = m[0]
  }
  return { md: md.slice(0, at) + replace + md.slice(at + matched.length), at, find: matched }
}

/** Revert an applied edit; null when the edited text can no longer be found. */
export function undoEdit(md: string, edit: Edit): string | null {
  const { at, find, replace } = edit
  if (replace && md.slice(at, at + replace.length) === replace) return md.slice(0, at) + find + md.slice(at + replace.length)
  if (replace) {
    let best = -1
    for (let i = md.indexOf(replace); i >= 0; i = md.indexOf(replace, i + 1)) {
      if (best < 0 || Math.abs(i - at) < Math.abs(best - at)) best = i
    }
    if (best < 0) return null
    return md.slice(0, best) + find + md.slice(best + replace.length)
  }
  const pos = Math.min(at, md.length)
  return md.slice(0, pos) + find + md.slice(pos)
}

/* ---------- summary ---------- */

export interface SummaryLine {
  readonly tag: '高亮' | '评论' | '讨论' | '已修改' | '已撤销'
  readonly quote: string
  readonly body: string
  readonly order: number
}

export function counts(s: DocState): { hl: number; cmt: number; edits: number; open: number; done: number } {
  const real = s.threads.filter((t) => !t.draft)
  return {
    hl: s.highlights.length,
    cmt: real.length,
    edits: real.filter((t) => t.edit?.status === 'applied').length,
    open: real.filter((t) => !t.resolved).length,
    done: real.filter((t) => t.resolved).length,
  }
}

export function activityParts(s: DocState): string[] {
  const c = counts(s)
  const parts: string[] = []
  if (c.hl) parts.push(c.hl + ' 处高亮')
  if (c.cmt) parts.push(c.cmt + ' 条评论')
  if (c.edits) parts.push('已修订 ' + c.edits + ' 处')
  return parts
}

const lastAgent = (t: Thread): Msg | undefined => t.messages.filter((m) => m.role === 'agent' && m.text && m.status !== 'error').slice(-1)[0]

/** One line per highlight / thread, in document order. `full` keeps texts unabridged. */
export function summaryLines(s: DocState, full = false): SummaryLine[] {
  const cut = (text: string, n: number): string => (full ? text.trim() : shorten(text, n))
  const lines: SummaryLine[] = []
  for (const h of s.highlights) lines.push({ tag: '高亮', quote: cut(h.anchor.quote, 24), body: '你标记了这段讲得好', order: h.anchor.start })
  for (const t of s.threads) {
    if (t.draft) continue
    const agent = lastAgent(t)
    const users = t.messages.filter((m) => m.role === 'user').map((m) => m.text)
    let tag: SummaryLine['tag'] = agent ? '讨论' : '评论'
    let body = full ? users.join(' / ') + (agent ? '\nAgent：' + agent.text : '') : agent ? agent.text : users[0] ?? ''
    if (t.edit?.status === 'undone') {
      tag = '已撤销'
      body = (full ? users.join(' / ') + '\n' : '') + 'Agent 曾按要求修改正文，已撤销，正文保持原样'
    }
    if (t.edit?.status === 'applied') {
      tag = '已修改'
      body = (full ? users.join(' / ') + '\n' : '') + (t.edit.replace ? '改为：' + (full ? t.edit.replace : plainOf(t.edit.replace)) : '已删除这段')
    }
    lines.push({ tag, quote: cut(t.quote, 24), body: cut(body, 56), order: t.anchor?.start ?? Number.MAX_SAFE_INTEGER })
  }
  return lines.sort((a, b) => a.order - b.order)
}

/** Delimiters of the serialized summary; the chat folds everything between them into a pill. */
export const REF_OPEN = '【参考材料：文档模式阅读记录】'
export const REF_CLOSE = '【/参考材料】'

/** The text the model receives when the summary rides the next message. */
export function serializeSummary(s: DocState): string {
  const lines = summaryLines(s, true)
  const out = [
    REF_OPEN + '我把你的回复「' + s.title + '」当作文档读了一遍，下面是我留下的高亮、评论和讨论（高亮＝我认可、讲得好的地方）。',
    '',
  ]
  lines.forEach((l, i) => {
    out.push(i + 1 + '. [' + l.tag + '] 「' + l.quote + '」')
    for (const b of l.body.split('\n')) out.push('   ' + b)
  })
  if (s.markdown !== s.original) {
    out.push('', '阅读中正文已被修订，修订后的全文如下：', '<document>', s.markdown, '</document>')
  }
  out.push('', '请把这些作为背景，回应我接下来的消息。', REF_CLOSE, '')
  return out.join('\n')
}
