/**
 * Sent messages that carry a reading summary: the model receives the full
 * text, but the chat folds the summary into a small pill (click to expand).
 * A user-text rule marks the summary span; the slot renders that node.
 */
import { useState } from 'react'
import { Icon } from '../ui.tsx'
import { REF_CLOSE, REF_OPEN } from './store.ts'
import { REVIEW_CLOSE } from '../model.ts'

/** Older summaries were sent without the closing marker; they end on this line. */
const LEGACY_END = '请把这些作为背景，回应我接下来的消息。'

export const REF_NODE_ID = 'dsh-review-ref'

export const refRule = {
  id: REF_NODE_ID,
  order: 5,
  match(text: string, from: number) {
    const start = text.indexOf(REF_OPEN, from)
    if (start < 0) return undefined
    let end = text.indexOf(REF_CLOSE, start)
    if (end >= 0) end += REF_CLOSE.length
    else {
      const legacy = text.indexOf(LEGACY_END, start)
      if (legacy < 0) return undefined
      end = legacy + LEGACY_END.length
    }
    while (end < text.length && /\s/.test(text[end]!)) end++
    return { id: REF_NODE_ID, start, end, data: {} }
  },
}

function describe(raw: string): string {
  const n = (re: RegExp): number => (raw.match(re) ?? []).length
  const parts: string[] = []
  const hl = n(/\[高亮\]/g)
  const cmt = n(/\[(评论|讨论|已修改|已撤销)\]/g)
  const edits = n(/\[已修改\]/g)
  if (hl) parts.push(hl + ' 处高亮')
  if (cmt) parts.push(cmt + ' 条评论')
  if (edits) parts.push('已修订 ' + edits + ' 处')
  return parts.join(' · ')
}

export function RefMessage({ raw }: { raw: string }) {
  const [open, setOpen] = useState(false)
  const body = raw.replace(REF_OPEN, '').replace(REF_CLOSE, '').trim()
  return (
    <span className="dsd-refmsg" data-dsr-ui="true">
      <button type="button" className="dsd-refpill" onClick={() => setOpen(!open)} title={open ? '收起' : '展开阅读摘要'}>
        <Icon name="doc" size={13} width={1.8} />
        文档模式阅读摘要
        <span className="sub">{describe(raw)}</span>
        <Icon name={open ? 'up' : 'down'} size={12} width={2} />
      </button>
      {open ? <span className="dsd-refbody">{body}</span> : null}
    </span>
  )
}

/* ---------- conversation-mode review notes ---------- */

export const REVIEW_NODE_ID = 'dsh-review-notes'
const REVIEW_OPEN = '【审阅意见'

export const reviewRule = {
  id: REVIEW_NODE_ID,
  order: 6,
  match(text: string, from: number) {
    const start = text.indexOf(REVIEW_OPEN, from)
    if (start < 0) return undefined
    const close = text.indexOf(REVIEW_CLOSE, start)
    /* Notes sent before the closing marker existed run to the end of the message. */
    let end = close >= 0 ? close + REVIEW_CLOSE.length : text.length
    while (end < text.length && /\s/.test(text[end]!)) end++
    return { id: REVIEW_NODE_ID, start, end, data: {} }
  },
}

export function ReviewNotesMessage({ raw }: { raw: string }) {
  const [open, setOpen] = useState(false)
  const revise = raw.startsWith('【审阅意见·请出修订版】')
  const kinds: Record<string, number> = {}
  for (const m of raw.matchAll(/(?:批注|意见) \d+｜(\S+)/g)) kinds[m[1]!] = (kinds[m[1]!] ?? 0) + 1
  const total = Object.values(kinds).reduce((a, b) => a + b, 0)
  const parts = Object.entries(kinds).map(([k, n]) => k + ' ' + n)
  if (/(整体|总体)意见：/.test(raw)) parts.push('整体意见')
  const body = raw.replace(REVIEW_CLOSE, '').trim()
  return (
    <span className="dsd-refmsg" data-dsr-ui="true">
      <button type="button" className="dsd-refpill" onClick={() => setOpen(!open)} title={open ? '收起' : '展开审阅意见'}>
        <Icon name="comment" size={13} width={1.8} />
        {revise ? '审阅意见 · 出修订版' : '审阅意见 · 逐条回应'}
        <span className="sub">{(total ? total + ' 条批注' : '') + (parts.length ? '（' + parts.join('、') + '）' : '')}</span>
        <Icon name={open ? 'up' : 'down'} size={12} width={2} />
      </button>
      {open ? <span className="dsd-refbody">{body}</span> : null}
    </span>
  )
}
