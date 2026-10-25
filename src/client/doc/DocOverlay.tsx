/**
 * Document mode: the reply opens as a reading document over the conversation
 * column (dsh's sidebar stays). Select text → 高亮 (strong approval) or 评论.
 * Comments are margin threads; the agent replies in the thread when asked
 * (toggle, default on and remembered; or @Agent) and edits the document
 * directly when told to, with undo. Exiting offers to bring the reading back
 * to the conversation as reference material above the composer.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Icon, Markdown } from '../ui.tsx'
import { covers, offsetOf, overlaps, rangeOf, resolve, shorten, flatten, type Anchor } from './anchor.ts'
import { activityParts, counts, setAgentDefault, summaryLines, serializeSummary, type DocState, type DocStore, type Thread } from './store.ts'
import { DocController, visibleReply } from './controller.ts'
import { docView, type OpenDoc } from './view.ts'
import { attachments } from './attach.ts'
import type { AgentDeps } from './agent.ts'

interface HighlightRegistry {
  set(name: string, value: unknown): void
  delete(name: string): void
}
declare const Highlight: { new (...ranges: Range[]): unknown } | undefined
const registry = (): HighlightRegistry | null => {
  const css = (globalThis as { CSS?: { highlights?: HighlightRegistry } }).CSS
  return css?.highlights && typeof Highlight !== 'undefined' ? css.highlights : null
}
const HL_NAMES = ['dsd-hl', 'dsd-cmt', 'dsd-active', 'dsd-flash'] as const

/** The conversation column the document covers. */
function columnRect(): DOMRect {
  const col = document.querySelector('[class*="centerCol"]')
  if (col) return col.getBoundingClientRect()
  const row = document.querySelector('[data-chat-flow-key]')
  for (let e = row?.parentElement ?? null; e; e = e.parentElement) {
    const r = e.getBoundingClientRect()
    if (r.height >= window.innerHeight - 4 && r.width > 0) return r
  }
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight)
}

function useColumnRect(): DOMRect {
  const [rect, setRect] = useState(columnRect)
  useEffect(() => {
    const update = (): void => setRect(columnRect())
    const ro = new ResizeObserver(update)
    const col = document.querySelector('[class*="centerCol"]')
    if (col) ro.observe(col)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])
  return rect
}

interface Sel {
  readonly anchor: Anchor
  readonly hlIds: readonly number[]
  readonly x: number
  readonly y: number
  /** Toolbar shown for a clicked highlight (no text selection). */
  readonly fromHighlight: boolean
}

export interface DocOverlayProps {
  readonly deps: AgentDeps
}

export const DocOverlay = memo(function DocOverlay({ deps }: DocOverlayProps) {
  const open = useSyncExternalStore(docView.subscribe, docView.getSnapshot)
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = document.createElement('div')
    el.dataset.dsrDoc = 'true'
    el.className = 'dsd-host'
    document.body.appendChild(el)
    setHost(el)
    return () => el.remove()
  }, [])
  if (!open || !host) return null
  return createPortal(<DocView key={open.messageId} open={open} deps={deps} />, host)
})

function DocView({ open, deps }: { open: OpenDoc; deps: AgentDeps }) {
  const store = open.store
  const s = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const controller = useMemo(() => new DocController(store, deps), [store, deps])
  useEffect(() => () => controller.dispose(), [controller])
  const rect = useColumnRect()

  const docRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sel, setSel] = useState<Sel | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [flash, setFlash] = useState<number | null>(null)
  const [panel, setPanel] = useState<'open' | 'done' | null>(null)
  const [modal, setModal] = useState(false)
  const [hint, setHint] = useState(() => !s.threads.length && !s.highlights.length)
  const [tops, setTops] = useState<Record<number, number>>({})
  const lastTops = useRef<Record<number, number>>({})

  /*
   * Re-resolve anchors after the Markdown re-renders (edits, undo). Only
   * successful re-anchoring is persisted: a quote that cannot be found right
   * now (renderer not settled, passage rewritten) keeps its stored anchor and
   * is simply not painted, instead of being lost for good.
   */
  useLayoutEffect(() => {
    const root = bodyRef.current
    if (!root || !root.textContent?.trim()) return
    let changed = false
    const threads = s.threads.map((t) => {
      const r = t.anchor ? resolve(root, t.anchor) : null
      if (!r || r === t.anchor) return t
      changed = true
      return { ...t, anchor: r }
    })
    const highlights = s.highlights.map((h) => {
      const r = resolve(root, h.anchor)
      if (!r || r === h.anchor) return h
      changed = true
      return { ...h, anchor: r }
    })
    if (changed) store.update((st) => ({ ...st, threads, highlights }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the text changes
  }, [s.markdown])

  /** Live DOM range of an anchor, or null when its quote is not in the document right now. */
  const liveRange = (a: Anchor | null | undefined): Range | null => {
    const root = bodyRef.current
    const r = root && a ? resolve(root, a) : null
    return r && root ? rangeOf(root, r.start, r.end) : null
  }

  /* Flash the passage an edit just rewrote. */
  const editSig = s.threads.map((t) => t.id + ':' + (t.edit?.status ?? '')).join(',')
  const prevEdits = useRef(editSig)
  useEffect(() => {
    const before = new Map(prevEdits.current.split(',').map((x) => x.split(':') as [string, string]))
    prevEdits.current = editSig
    const hit = s.threads.find((t) => t.edit?.status === 'applied' && before.get(String(t.id)) !== 'applied')
    if (!hit) return
    setFlash(hit.id)
    const tm = window.setTimeout(() => setFlash((f) => (f === hit.id ? null : f)), 1800)
    return () => window.clearTimeout(tm)
  }, [editSig, s.threads])

  /* Paint marks. */
  useLayoutEffect(() => {
    const reg = registry()
    const root = bodyRef.current
    if (!reg || !root) return
    const ranges = (anchors: (Anchor | null | undefined)[]): Range[] =>
      anchors.flatMap((a) => [liveRange(a)].filter((r): r is Range => r !== null))
    const live = s.threads.filter((t) => !t.resolved)
    const sets: Record<(typeof HL_NAMES)[number], Range[]> = {
      'dsd-hl': ranges(s.highlights.map((h) => h.anchor)),
      'dsd-cmt': ranges(live.filter((t) => !t.draft).map((t) => t.anchor)),
      'dsd-active': ranges([live.find((t) => t.id === active)?.anchor]),
      'dsd-flash': ranges([s.threads.find((t) => t.id === flash)?.anchor]),
    }
    for (const name of HL_NAMES) {
      const list = sets[name]
      if (list.length) reg.set(name, new Highlight!(...list))
      else reg.delete(name)
    }
  })
  useEffect(
    () => () => {
      const reg = registry()
      if (reg) for (const name of HL_NAMES) reg.delete(name)
    },
    [],
  )

  /* Margin thread layout: the active card sits at its passage, others flow around it. */
  useLayoutEffect(() => {
    const rail = railRef.current
    const root = bodyRef.current
    if (!rail || !root) return
    const rr = rail.getBoundingClientRect()
    const items = s.threads
      .filter((t) => !t.resolved)
      .map((t) => {
        const range = liveRange(t.anchor)
        const r = range?.getClientRects()[0]
        const card = rail.querySelector<HTMLElement>('[data-thread="' + t.id + '"]')
        const anchorTop = r ? r.top - rr.top - 6 : lastTops.current[t.id] ?? 0
        return { id: t.id, anchor: anchorTop, h: card ? card.offsetHeight : 90, top: 0 }
      })
      .sort((a, b) => a.anchor - b.anchor || a.id - b.id)
    if (!items.length) return
    const gap = 10
    let pivot = items.findIndex((x) => x.id === active)
    if (pivot < 0) pivot = 0
    items[pivot]!.top = Math.max(0, items[pivot]!.anchor)
    for (let i = pivot + 1; i < items.length; i++) items[i]!.top = Math.max(items[i]!.anchor, items[i - 1]!.top + items[i - 1]!.h + gap)
    for (let i = pivot - 1; i >= 0; i--) items[i]!.top = Math.min(items[i]!.anchor, items[i + 1]!.top - items[i]!.h - gap)
    if (items[0]!.top < 0) {
      items[0]!.top = 0
      for (let i = 1; i < items.length; i++) items[i]!.top = Math.max(items[i]!.top, items[i - 1]!.top + items[i - 1]!.h + gap)
    }
    const next: Record<number, number> = {}
    let changed = false
    for (const x of items) {
      next[x.id] = Math.round(x.top)
      if (tops[x.id] !== next[x.id]) changed = true
    }
    if (changed) {
      lastTops.current = { ...lastTops.current, ...next }
      setTops(next)
    }
  })
  /* Relayout when the window or the column width changes. */
  const [, bump] = useState(0)
  useEffect(() => {
    const on = (): void => bump((n) => n + 1)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  /* ---------- exit ---------- */
  const close = useCallback(() => {
    store.dropDrafts()
    docView.close()
  }, [store])
  const requestExit = useCallback(() => {
    const c = counts(store.getSnapshot())
    setSel(null)
    setPanel(null)
    if (!c.cmt && !c.hl) close()
    else setModal(true)
  }, [store, close])
  const bringBack = (): void => {
    const st = store.getSnapshot()
    attachments.stage({
      id: 'doc-' + st.messageId + '-' + Date.now().toString(36),
      sessionId: st.sessionId,
      title: '文档模式阅读摘要',
      sub: activityParts(st).join(' · '),
      lines: summaryLines(st),
      text: serializeSummary(st),
    })
    close()
  }
  const onEscape = (): void => {
    if (modal) setModal(false)
    else if (sel) setSel(null)
    else if (panel) setPanel(null)
    else if (active !== null) setActive(null)
    else requestExit()
  }
  const escRef = useRef(onEscape)
  escRef.current = onEscape
  /* Escape pressed while focus sits outside the document (e.g. on the page body). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') escRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  /* Keep the document's events away from dsh underneath (its composer grabs focus on stray clicks / keys). */
  const isolate = (e: React.SyntheticEvent): void => e.stopPropagation()
  const onRootKey = (e: React.KeyboardEvent): void => {
    e.stopPropagation()
    if (e.key === 'Escape') onEscape()
  }

  /* ---------- selection ---------- */
  const toolbarAt = (range: Range): { x: number; y: number } => {
    const doc = docRef.current!.getBoundingClientRect()
    const first = range.getClientRects()[0] ?? range.getBoundingClientRect()
    const x = Math.min(Math.max(first.left - doc.left + 60, 110), doc.width - 110)
    return { x: Math.round(x), y: Math.round(first.top - doc.top) }
  }
  const onMouseUp = (): void => {
    window.setTimeout(() => {
      const root = bodyRef.current
      const w = window.getSelection()
      if (!root || !w || w.isCollapsed || w.rangeCount === 0) return
      const range = w.getRangeAt(0)
      const a = offsetOf(root, range.startContainer, range.startOffset)
      const b = offsetOf(root, range.endContainer, range.endOffset)
      if (a === null || b === null || b <= a) return
      const quote = flatten(root).text.slice(a, b)
      if (!quote.trim()) return
      const anchor: Anchor = { start: a, end: b, quote }
      const hlIds = store.getSnapshot().highlights.filter((h) => overlaps(h.anchor, anchor)).map((h) => h.id)
      setSel({ anchor, hlIds, ...toolbarAt(range), fromHighlight: false })
    }, 0)
  }
  const onMouseDown = (e: React.MouseEvent): void => {
    if ((e.target as Element).closest?.('.dsd-tb')) return
    if (sel) setSel(null)
  }
  const onClick = (e: React.MouseEvent): void => {
    if ((e.target as Element).closest?.('.dsd-tb')) return
    const root = bodyRef.current
    const w = window.getSelection()
    if (!root || (w && !w.isCollapsed)) return
    const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }
    const caret = doc.caretRangeFromPoint?.(e.clientX, e.clientY)
    const pos = caret ? offsetOf(root, caret.startContainer, caret.startOffset) : null
    if (pos === null) {
      setActive(null)
      return
    }
    const st = store.getSnapshot()
    const t = st.threads.find((x) => !x.resolved && !x.draft && x.anchor && covers(x.anchor, pos))
    if (t) {
      setActive(t.id)
      setSel(null)
      return
    }
    const h = st.highlights.find((x) => covers(x.anchor, pos))
    if (h) {
      const range = liveRange(h.anchor)
      if (range) setSel({ anchor: h.anchor, hlIds: [h.id], ...toolbarAt(range), fromHighlight: true })
      return
    }
    setActive(null)
  }
  const tbDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }
  const addHighlight = (): void => {
    if (!sel) return
    window.getSelection()?.removeAllRanges()
    store.addHighlight(sel.anchor)
    setSel(null)
    setHint(false)
  }
  const removeHighlights = (): void => {
    if (!sel) return
    window.getSelection()?.removeAllRanges()
    store.removeHighlights(sel.hlIds)
    setSel(null)
  }
  const addComment = (): void => {
    if (!sel) return
    window.getSelection()?.removeAllRanges()
    store.dropDrafts()
    const id = store.createThread(sel.anchor)
    setActive(id)
    setFocusId(id)
    setSel(null)
    setHint(false)
  }

  const revealThread = (t: Thread): void => {
    const root = bodyRef.current
    const range = liveRange(t.anchor)
    const el = range?.startContainer.parentElement
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const c = counts(s)
  const parts = activityParts(s)
  const panelThreads = s.threads.filter((t) => !t.draft && (panel === 'done' ? t.resolved : !t.resolved))
  const lines = modal ? summaryLines(s) : []
  const firstHeading = /^\s*#\s+/.test(s.markdown)

  return (
    <div
      className="dsd-root"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      onKeyDown={onRootKey}
      onKeyUp={isolate}
      onKeyPress={isolate}
      onMouseDown={isolate}
      onMouseUp={isolate}
      onClick={isolate}
      onPointerDown={isolate}
      onPointerUp={isolate}
      onFocus={isolate}
      onBlur={isolate}
      onInput={isolate}
      onPaste={isolate}
      onCopy={isolate}
    >
      <header className="dsd-bar">
        <button type="button" className="dsd-back" onClick={requestExit}>
          <Icon name="back" size={16} width={2} />
          返回对话
        </button>
        <span className="dsd-divider" />
        <span className="dsd-pill">文档模式</span>
        <span className="dsd-title">{s.title}</span>
        <span className="dsd-spacer" />
        <button type="button" className={'dsd-panelbtn' + (panel ? ' on' : '')} aria-pressed={panel !== null} onClick={() => setPanel(panel ? null : 'open')}>
          <Icon name="comment" size={15} width={1.8} />
          {c.open ? '评论 ' + c.open : '评论'}
        </button>
      </header>
      <div className="dsd-scroll" ref={scrollRef}>
        <div className="dsd-wrap">
          <div className="dsd-doc" ref={docRef} onMouseUp={onMouseUp} onMouseDown={onMouseDown} onClick={onClick}>
            {firstHeading ? null : <h1 className="dsd-h1">{s.title}</h1>}
            <div className="dsd-meta">来自对话「{s.title}」中的 Agent 回复{s.markdown !== s.original ? ' · 已修订' : ''}</div>
            <div className="dsd-body" ref={bodyRef}>
              <Markdown text={s.markdown} />
            </div>
            {sel ? (
              <div className="dsd-tb" style={{ left: sel.x, top: sel.y }} role="toolbar" aria-label="选中文字">
                {sel.hlIds.length ? (
                  <button type="button" onMouseDown={tbDown} onClick={removeHighlights}>
                    <Icon name="x" size={15} width={1.8} />
                    取消高亮
                  </button>
                ) : (
                  <button type="button" title="标记讲得好的地方" onMouseDown={tbDown} onClick={addHighlight}>
                    <Icon name="highlight" size={15} width={1.8} />
                    高亮
                  </button>
                )}
                <span className="dsd-tb-sep" />
                <button type="button" onMouseDown={tbDown} onClick={addComment}>
                  <Icon name="comment" size={15} width={1.8} />
                  评论
                </button>
              </div>
            ) : null}
          </div>
          <aside className="dsd-rail" ref={railRef} aria-label="评论">
            {s.threads
              .filter((t) => !t.resolved)
              .map((t) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  top={tops[t.id] ?? lastTops.current[t.id] ?? 0}
                  active={active === t.id}
                  focus={focusId === t.id}
                  store={store}
                  controller={controller}
                  onActivate={() => {
                    setActive(t.id)
                    setSel(null)
                  }}
                  onCancel={() => {
                    store.update((st) => ({ ...st, threads: st.threads.filter((x) => x.id !== t.id) }))
                    setActive(null)
                  }}
                  onResolve={() => {
                    store.patchThread(t.id, (x) => ({ ...x, resolved: true }))
                    setActive(null)
                  }}
                />
              ))}
          </aside>
        </div>
      </div>
      {hint ? (
        <div className="dsd-hint">
          选中文字可以高亮或评论。评论默认由 Agent 回复，也可以请它直接修改正文。
          <button type="button" aria-label="关闭提示" onClick={() => setHint(false)}>
            <Icon name="x" size={12} width={2.2} />
          </button>
        </div>
      ) : null}
      {panel ? (
        <aside className="dsd-panel" aria-label="全部评论">
          <div className="dsd-panel-h">
            <span className="dsd-panel-title">评论</span>
            <span className="dsd-spacer" />
            <button type="button" className="dsd-ib" aria-label="关闭评论面板" onClick={() => setPanel(null)}>
              <Icon name="x" size={15} width={2} />
            </button>
          </div>
          <div className="dsd-tabs">
            <button type="button" className={'dsd-tab' + (panel === 'open' ? ' on' : '')} onClick={() => setPanel('open')}>
              未解决 {c.open}
            </button>
            <button type="button" className={'dsd-tab' + (panel === 'done' ? ' on' : '')} onClick={() => setPanel('done')}>
              已解决 {c.done}
            </button>
          </div>
          <div className="dsd-plist">
            {panelThreads.map((t) => {
              const first = t.messages.find((m) => m.role === 'user')
              const replies = t.messages.length - 1
              return (
                <button
                  key={t.id}
                  type="button"
                  className="dsd-pitem"
                  onClick={() => {
                    store.patchThread(t.id, (x) => ({ ...x, resolved: false }))
                    setPanel(null)
                    setActive(t.id)
                    revealThread(t)
                  }}
                >
                  <div className="dsd-pq">{t.quote}</div>
                  <div className="dsd-pb">{first?.text ?? ''}</div>
                  <div className="dsd-pm">
                    {(replies > 0 ? replies + ' 条回复' : '暂无回复') + (t.edit?.status === 'applied' ? ' · 已修改正文' : '') + (t.anchor ? '' : ' · 原文已改动')}
                  </div>
                </button>
              )
            })}
            {panelThreads.length === 0 ? <div className="dsd-pempty">{panel === 'open' ? '还没有未解决的评论' : '还没有已解决的评论'}</div> : null}
          </div>
        </aside>
      ) : null}
      {modal ? (
        <div className="dsd-overlay" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="dsd-modal" role="dialog" aria-label="带回主会话">
            <div className="dsd-mh">把这次阅读带回主会话？</div>
            <div className="dsd-md">
              这次阅读里有 {parts.join('、')}。带回后，摘要会作为参考材料附在输入框上方，随你的下一条消息一起发给 Agent；不带回，它们也都会留在文档里。
            </div>
            <div className="dsd-mlist">
              {lines.map((l, i) => (
                <SummaryRow key={i} tag={l.tag} quote={l.quote} body={l.body} />
              ))}
            </div>
            <div className="dsd-mrow">
              <button type="button" className="dsd-btn ghost" onClick={() => setModal(false)}>
                继续阅读
              </button>
              <span className="dsd-spacer" />
              <button type="button" className="dsd-btn" onClick={close}>
                仅返回
              </button>
              <button type="button" className="dsd-btn primary" onClick={bringBack}>
                带回主会话
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function SummaryRow({ tag, quote, body }: { tag: string; quote: string; body: string }) {
  const cls = tag === '高亮' ? 't-hl' : tag === '已修改' || tag === '已撤销' ? 't-edit' : 't-cmt'
  return (
    <div className="dsd-sline">
      <span className={'dsd-stag ' + cls}>{tag}</span>
      <div>
        <div className="dsd-sq">「{quote}」</div>
        <div className="dsd-sb">{body}</div>
      </div>
    </div>
  )
}

const ThreadCard = memo(function ThreadCard({
  thread: t, top, active, focus, store, controller, onActivate, onCancel, onResolve,
}: {
  thread: Thread
  top: number
  active: boolean
  focus: boolean
  store: DocStore
  controller: DocController
  onActivate: () => void
  onCancel: () => void
  onResolve: () => void
}) {
  const area = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    /* Never let focusing the new comment scroll the document. */
    if (!focus) return
    const raf = requestAnimationFrame(() => area.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(raf)
  }, [focus])
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = Math.min(160, el.scrollHeight) + 'px'
  }, [t.input, active])
  const busy = t.messages.some((m) => m.status === 'pending' || m.status === 'streaming')
  const showComposer = t.draft || active
  const send = (): void => {
    if (!t.input.trim()) return
    controller.send(t.id)
  }
  return (
    <div className={'dsd-card' + (active ? ' is-active' : '')} data-thread={t.id} style={{ top }} onMouseDown={onActivate}>
      {!t.draft ? (
        <button type="button" className="dsd-resolve" aria-label="标记为已解决" title="标记为已解决" onClick={onResolve}>
          <Icon name="check" size={16} width={2} />
        </button>
      ) : null}
      {t.messages.map((m) => (
        <div key={m.id} className={'dsd-msg' + (m.role === 'agent' ? ' r-agent' : '')}>
          <div className="dsd-who">
            <span className="dsd-name">{m.role === 'agent' ? 'Agent' : '你'}</span>
          </div>
          {m.role === 'agent' && m.status === 'pending' ? (
            <div className="dsd-thinking">
              <i />
              <i />
              <i />
              正在思考
            </div>
          ) : m.role === 'agent' ? (
            <div className={'dsd-mt dsd-md-text' + (m.status === 'error' ? ' is-error' : '')}>
              <Markdown text={visibleReply(m.text) || (m.status === 'streaming' ? '正在修改正文…' : m.text)} streaming={m.status === 'streaming'} />
            </div>
          ) : (
            <div className="dsd-mt">{m.text}</div>
          )}
        </div>
      ))}
      {t.edit?.status === 'applied' ? (
        <div className="dsd-editrow">
          <span className="dot" />
          已修改正文
          <button type="button" className="dsd-link" onClick={() => controller.undo(t.id)}>
            撤销
          </button>
        </div>
      ) : null}
      {t.edit?.status === 'undone' ? (
        <div className="dsd-editrow">
          已撤销修改，正文恢复原样
          <button type="button" className="dsd-link" onClick={() => controller.redo(t.id)}>
            重新应用
          </button>
        </div>
      ) : null}
      {t.edit?.status === 'failed' ? <div className="dsd-editrow">没能在正文里定位到要改的原文，正文未改动</div> : null}
      {showComposer ? (
        <div className="dsd-cc">
          <textarea
            ref={area}
            rows={1}
            value={t.input}
            placeholder={t.draft ? '添加评论…（@Agent 也可以让它回复）' : '回复…'}
            aria-label="评论内容"
            onChange={(e) => store.patchThread(t.id, (x) => ({ ...x, input: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                send()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                if (t.draft && !t.input.trim()) onCancel()
                else e.currentTarget.blur()
              }
            }}
          />
          <div className="dsd-ccrow">
            <button
              type="button"
              className={'dsd-toggle' + (t.askOn ? ' on' : '')}
              role="switch"
              aria-checked={t.askOn}
              onClick={() => {
                setAgentDefault(!t.askOn)
                store.patchThread(t.id, (x) => ({ ...x, askOn: !x.askOn }))
              }}
            >
              <span className="dsd-switch" />
              Agent 回复
            </button>
            <span className="dsd-spacer" />
            {t.draft ? (
              <button type="button" className="dsd-btn ghost sm" onClick={onCancel}>
                取消
              </button>
            ) : null}
            <button type="button" className="dsd-send" aria-label="发送" disabled={!t.input.trim() || busy} onClick={send}>
              <Icon name="send" size={14} width={2.2} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
})

export type { DocState }
export { shorten }
