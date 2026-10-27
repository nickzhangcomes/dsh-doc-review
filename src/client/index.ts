/**
 * dsh-review client plugin: document-style review of assistant replies.
 * - selection toolbar (pure DOM): comment and mark actions on selected prose;
 * - in-place marks (CSS Custom Highlight API, no chat DOM mutation);
 * - margin cards + slim send bar, rendered through portals by a zero-height
 *   host registered in `conversation.input.dock` (it owns the session's input
 *   machine, so sending goes through the official composer path).
 */
import { createElement } from 'react'
import { KINDS, ReviewStore, type ReviewKind } from './model.ts'
import { HighlightPainter } from './highlights.ts'
import { createToolbar } from './toolbar.ts'
import { ReviewLayer, type FocusRequest } from './ReviewLayer.tsx'
import { ensureStyles } from './styles.ts'
import { DocOverlay } from './doc/DocOverlay.tsx'
import { ATTACH_SOURCE, makeAttachDock, makeDocEntry } from './doc/entry.tsx'
import { attachments } from './doc/attach.ts'
import { sweepChildren } from './doc/agent.ts'
import { RefMessage, REF_NODE_ID, refRule, ReviewNotesMessage, REVIEW_NODE_ID, reviewRule } from './doc/refmsg.tsx'

/** Required services. */
export const inject = ['slots', 'sessions', 'uiConversation', 'inputTriggers', 'workspaces']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClientContext = any

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ensureStyles(), 'review: stylesheet')

  const painter = new HighlightPainter()
  ctx.effect(() => () => painter.dispose(), 'review: highlights')

  const stores = new Map<string, ReviewStore>()
  const storeFor = (sessionId: string): ReviewStore => {
    let store = stores.get(sessionId)
    if (!store) {
      store = new ReviewStore(sessionId)
      stores.set(sessionId, store)
    }
    return store
  }

  /* "A mark was just created" → the layer activates (and focuses) its card. */
  const focusListeners = new Set<(req: FocusRequest) => void>()
  const onFocusRequest = (fn: (req: FocusRequest) => void): (() => void) => {
    focusListeners.add(fn)
    return () => {
      focusListeners.delete(fn)
    }
  }

  /* Mounted hosts in mount order; the toolbar stages into the latest one. */
  const mounted = new Map<string, true>()
  const currentSession = (): string | null => {
    let last: string | null = null
    for (const id of mounted.keys()) last = id
    return last
  }

  ctx.effect(
    () =>
      createToolbar({
        stage: (kind: ReviewKind, quote: string, rowKey: string | null, range: Range) => {
          const sessionId = currentSession()
          if (sessionId === null) return null
          const id = storeFor(sessionId).add(kind, quote, '', rowKey)
          painter.seed(id, range)
          const req: FocusRequest = { id, focus: KINDS[kind].needsNote }
          for (const fn of focusListeners) fn(req)
          return id
        },
      }),
    'review: toolbar',
  )

  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: 'review',
        order: 90,
        inject: (sessionId: string) => ({
          review: storeFor(String(sessionId)),
          painter,
          onFocusRequest,
          trackDock: () => {
            const key = String(sessionId)
            mounted.delete(key)
            mounted.set(key, true)
            return () => {
              mounted.delete(key)
            }
          },
        }),
      },
      ReviewLayer,
    ),
  )

  /* ---------- document mode ---------- */
  const deps = { sessions: ctx.sessions, uiConversation: ctx.uiConversation, workspaces: ctx.workspaces }
  const DocEntry = makeDocEntry(deps)
  /* Leftover side sessions from an earlier reading are archived once the shell has settled. */
  ctx.effect(() => {
    const tm = window.setTimeout(() => void sweepChildren(deps), 4000)
    return () => window.clearTimeout(tm)
  }, 'review: sweep side sessions')
  const AttachDock = makeAttachDock(ctx.sessions)

  ctx.slots.inject('conversation.chat.assistant-actions', () =>
    ctx.slots.register({ name: 'conversation.chat.assistant-actions', id: 'review-doc', order: 30 }, DocEntry),
  )
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register({ name: 'shell.overlay', id: 'review-doc', order: 60 }, () => createElement(DocOverlay, { deps })),
  )
  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register({ name: 'conversation.input.dock', id: 'review-attach', order: 6 }, AttachDock),
  )

  /* Sent summaries fold into a pill in the chat (the model still gets the full text). */
  try {
    for (const rule of [refRule, reviewRule]) {
      const off = ctx.uiConversation.userText.register(rule)
      if (typeof off === 'function') ctx.effect(() => off, 'review: user-text rule ' + rule.id)
    }
  } catch (err) {
    console.error('[dsh-markup] user-text rule registration failed:', err)
  }
  ctx.slots.inject('conversation.user.text.node', () =>
    ctx.slots.register({ name: 'conversation.user.text.node', key: REF_NODE_ID, priority: 100 }, RefMessage),
  )
  ctx.slots.inject('conversation.user.text.node', () =>
    ctx.slots.register({ name: 'conversation.user.text.node', key: REVIEW_NODE_ID, priority: 100 }, ReviewNotesMessage),
  )

  /* The brought-back summary rides the draft as a chip; serialize it on submit. */
  try {
    const off = ctx.inputTriggers.registerSource({
      trigger: '@',
      name: ATTACH_SOURCE,
      candidates: async () => [],
      onPick: () => 'handled',
      codec: {
        clipboardText: (ref: string) => attachments.get(ref)?.text ?? '',
        serialize: async (ref: string) => attachments.get(ref)?.text ?? '',
      },
    })
    if (typeof off === 'function') ctx.effect(() => off, 'review: attach codec')
  } catch (err) {
    console.error('[dsh-markup] reference codec registration failed:', err)
  }
}
