/**
 * Conversation-side faces of document mode:
 * - DocEntry: the 以文档模式阅读 button under each reply (+ activity badge);
 * - AttachDock: the brought-back reading summary above the composer, riding
 *   the draft as a reference chip that our codec serializes on submit.
 */
import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Icon } from '../ui.tsx'
import { activityParts, type DocState } from './store.ts'
import { docFor, docView } from './view.ts'
import { attachments, type Attachment } from './attach.ts'
import { SummaryRow } from './DocOverlay.tsx'

/* eslint-disable @typescript-eslint/no-explicit-any -- runtime services are untyped */

// Persisted draft references from versions <= 0.1.1 use this wire identifier.
// Keep it stable across the public rename to dsh-markup.
export const ATTACH_SOURCE = 'dsh-doc-review'

const noopSub = (): (() => void) => () => {}
const nullSnap = (): DocState | null => null

export function makeDocEntry(deps: { sessions: any; uiConversation: any }) {
  return memo(function DocEntry({ sessionId, messageId }: { sessionId: string; messageId: string }) {
    const openDoc = useSyncExternalStore(docView.subscribe, docView.getSnapshot)
    const store = useMemo(() => docFor(deps, String(sessionId), String(messageId)), [sessionId, messageId, openDoc])
    const s = useSyncExternalStore(store ? store.subscribe : noopSub, store ? store.getSnapshot : nullSnap)
    const [failed, setFailed] = useState(false)
    const parts = s ? activityParts(s) : []
    return (
      <span className="dsd-entry" data-dsr-ui="true">
        <button
          type="button"
          className="dsd-docbtn"
          title={failed ? '这条回复还没有可阅读的正文' : '把这条回复当作文档阅读、高亮和评论'}
          onClick={() => {
            const ok = docView.open(deps, String(sessionId), String(messageId))
            setFailed(!ok)
          }}
        >
          <Icon name="doc" size={14} width={1.8} />
          以文档模式阅读
        </button>
        {parts.length ? <span className="dsd-badge">文档模式 · {parts.join(' · ')}</span> : null}
      </span>
    )
  })
}

function emit(sessions: any, sessionId: string, event: string, payload: unknown): boolean {
  try {
    const actx = sessions.scope(sessionId)
    return actx?.bail?.(actx, event, payload) === true
  } catch {
    return false
  }
}

interface Occurrence {
  readonly source: string
  readonly ref: string
  readonly offset: number
}

export function makeAttachDock(sessions: any) {
  return memo(function AttachDock({
    sessionId,
    useInput,
  }: {
    sessionId: string
    useInput: <T>(select: (s: any) => T) => T
  }) {
    const sid = String(sessionId)
    useSyncExternalStore(attachments.subscribe, attachments.getVersion)
    const input = useInput((i: any) => i)
    const occurrences: Occurrence[] = Array.isArray(input?.occurrences) ? input.occurrences : []
    const pending = attachments.pending(sid)
    const settled = useRef(new Set<string>())
    const [open, setOpen] = useState<string | null>(null)

    /* Insert the chip for a freshly brought-back summary. */
    useEffect(() => {
      if (!pending) return
      const draft = String(input?.draft ?? '')
      const ok = emit(sessions, sid, 'slash/input-insert-reference', {
        reference: { source: ATTACH_SOURCE, ref: pending.id, label: '​', clipboardText: pending.text },
        span: { start: draft.length, end: draft.length, draftRev: input?.draftRev ?? -1 },
      })
      if (ok) attachments.settle(pending)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- once per staged summary
    }, [pending?.id])

    /* The draft survives a reload but chip occurrences do not: consume ours first. */
    const inputRef = useRef(input)
    inputRef.current = input
    useEffect(() => {
      const onUnload = (): void => {
        const st = inputRef.current
        for (const o of (Array.isArray(st?.occurrences) ? st.occurrences : []) as Occurrence[]) {
          if (o.source === ATTACH_SOURCE) emit(sessions, sid, 'slash/input-consume-token', { guard: { kind: 'span', span: { start: o.offset, end: o.offset + 1, draftRev: st?.draftRev ?? -1 } } })
        }
      }
      window.addEventListener('beforeunload', onUnload)
      return () => window.removeEventListener('beforeunload', onUnload)
    }, [sid])

    /*
     * After a reload the chip is gone (consumed on unload) but the summary is
     * still stored: put it back into the composer once the input has settled.
     */
    useEffect(() => {
      const tm = window.setTimeout(() => {
        const st = inputRef.current
        const occ = (Array.isArray(st?.occurrences) ? st.occurrences : []) as Occurrence[]
        const orphans = attachments.forSession(sid).filter((a) => !occ.some((o) => o.source === ATTACH_SOURCE && o.ref === a.id))
        const latest = orphans[orphans.length - 1]
        for (const a of orphans) if (a !== latest) attachments.drop(a.id)
        if (latest && !attachments.pending(sid)) attachments.stage(latest)
      }, 600)
      return () => window.clearTimeout(tm)
    }, [sid])

    const live = attachments.forSession(sid).filter((a) => occurrences.some((o) => o.source === ATTACH_SOURCE && o.ref === a.id))

    /* Drop summaries whose chip left the draft (sent, or edited away) — only after it was once seen. */
    useEffect(() => {
      const present = new Set<string>()
      for (const a of attachments.forSession(sid)) {
        if (occurrences.some((o) => o.source === ATTACH_SOURCE && o.ref === a.id)) present.add(a.id)
        else if (settled.current.has(a.id)) attachments.drop(a.id)
      }
      settled.current = present
    })

    if (!live.length) return null
    const remove = (a: Attachment): void => {
      const occ = occurrences.find((o) => o.source === ATTACH_SOURCE && o.ref === a.id)
      if (occ) emit(sessions, sid, 'slash/input-consume-token', { guard: { kind: 'span', span: { start: occ.offset, end: occ.offset + 1, draftRev: input?.draftRev ?? -1 } } })
      attachments.drop(a.id)
    }
    return (
      <div className="dsd-attachdock" data-dsr-ui="true">
        {live.map((a) => (
          <div key={a.id} className="dsd-attach">
            <div className="dsd-attach-h">
              <Icon name="doc" size={15} width={1.8} />
              <span className="dsd-attach-title">{a.title}</span>
              <span className="dsd-attach-sub">{a.sub}</span>
              <span className="dsd-spacer" />
              <button type="button" className="dsd-ib sm" title={open === a.id ? '收起摘要' : '展开摘要'} aria-label={open === a.id ? '收起摘要' : '展开摘要'} onClick={() => setOpen(open === a.id ? null : a.id)}>
                <Icon name={open === a.id ? 'up' : 'down'} size={14} width={2} />
              </button>
              <button type="button" className="dsd-ib sm" title="移除参考材料" aria-label="移除参考材料" onClick={() => remove(a)}>
                <Icon name="x" size={13} width={2} />
              </button>
            </div>
            {open === a.id ? (
              <div className="dsd-attach-list">
                {a.lines.map((l, i) => (
                  <SummaryRow key={i} tag={l.tag} quote={l.quote} body={l.body} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    )
  })
}
