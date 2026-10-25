/**
 * Document-style review layer.
 * - Margin cards: one card per mark, pinned in the right margin beside the
 *   passage it annotates (Feishu / Google Docs comments). The active card
 *   aligns exactly with its text; the others flow around it. When the chat
 *   column leaves no margin, marks collapse to small markers and only the
 *   active card floats beside the text.
 * - Send bar: a slim floating pill above the composer — mark count, overall
 *   comment, clear, and the two ways to send (逐条回应 / 出修订版).
 * Mounted from `conversation.input.dock` (for the session's input machine)
 * but renders everything through portals, so nothing stacks on the composer.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { composeReview, incompleteItems, isSendable, KINDS, type ReviewItem, type ReviewKind, type ReviewMode, type ReviewStore } from './model.ts'
import { proseElement, scrollParent, type HighlightPainter } from './highlights.ts'
import { ICON_PATHS } from './icons.ts'
import { attachments } from './doc/attach.ts'
import { ATTACH_SOURCE } from './doc/entry.tsx'

export interface FocusRequest {
  readonly id: number
  readonly focus: boolean
}

export interface ReviewLayerProps {
  readonly review: ReviewStore
  readonly painter: HighlightPainter
  readonly trackDock: () => () => void
  /** Subscribe to "a mark was just created" requests from the toolbar. */
  readonly onFocusRequest: (fn: (req: FocusRequest) => void) => () => void
  readonly useInput: <T>(select: (s: { draft: string; phase: string; occurrences?: readonly { source: string; ref: string; offset: number }[] }) => T) => T
  readonly inputActions: { setDraft(text: string): void; submit(): void }
}

/**
 * The draft as plain text: reference chips are U+FFFC placeholders that would
 * lose their meaning once the draft is replaced, so a brought-back reading
 * summary is spelled out in full and any other chip is dropped.
 */
function flattenDraft(draft: string, occurrences: readonly { source: string; ref: string; offset: number }[] | undefined): string {
  const byOffset = new Map((occurrences ?? []).map((o) => [o.offset, o]))
  let out = ''
  for (let i = 0; i < draft.length; i++) {
    const ch = draft[i]!
    if (ch !== '\uFFFC') {
      out += ch
      continue
    }
    const occ = byOffset.get(i)
    if (occ?.source === ATTACH_SOURCE) out += attachments.get(occ.ref)?.text ?? ''
  }
  return out
}

const KIND_KEYS = Object.keys(KINDS) as ReviewKind[]
const CARD_GAP = 8
const DEFAULT_H = 84

const Icon = ({ name, size = 14 }: { name: keyof typeof ICON_PATHS; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICON_PATHS[name]} />
  </svg>
)

/** Frame ticker: re-render on scroll, resize and highlight repaints. */
function useLayoutTick(painter: HighlightPainter): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let raf = 0
    const bump = (): void => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setTick((t) => t + 1)
      })
    }
    const off = painter.onPaint(bump)
    document.addEventListener('scroll', bump, true)
    window.addEventListener('resize', bump)
    return () => {
      off()
      document.removeEventListener('scroll', bump, true)
      window.removeEventListener('resize', bump)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [painter])
  return tick
}

/** A body-level portal host that never belongs to dsh's own tree. */
function usePortalHost(className: string): HTMLDivElement | null {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = document.createElement('div')
    el.className = className
    el.dataset.dsrUi = 'true'
    document.body.appendChild(el)
    setHost(el)
    return () => el.remove()
  }, [className])
  return host
}

interface Placement {
  readonly item: ReviewItem
  readonly index: number
  readonly anchorTop: number
  readonly anchorBottom: number
  readonly anchorLeft: number
  top: number
}

interface Layout {
  readonly wide: boolean
  readonly x: number
  readonly width: number
  readonly markerX: number
  readonly proseLeft: number
  readonly proseRight: number
  readonly clip: DOMRect
  readonly placements: Placement[]
}

function computeLayout(items: readonly ReviewItem[], painter: HighlightPainter, heights: Map<number, number>, active: number | null): Layout | null {
  const raw: Placement[] = []
  let prose: DOMRect | null = null
  let viewport: DOMRect | null = null
  items.forEach((item, index) => {
    const range = painter.rangeFor(item)
    if (!range) return
    const rects = range.getClientRects()
    const rect = rects[0]
    const last = rects[rects.length - 1]
    if (!rect || !last) return
    if (!prose) {
      const body = proseElement(range.startContainer)
      if (body) {
        prose = body.getBoundingClientRect()
        viewport = (scrollParent(body) ?? document.documentElement).getBoundingClientRect()
      }
    }
    raw.push({ item, index, anchorTop: rect.top, anchorBottom: last.bottom, anchorLeft: rect.left, top: rect.top })
  })
  if (!prose || !viewport || raw.length === 0) return null
  const p = prose as DOMRect
  const v = viewport as DOMRect
  const gutter = v.right - p.right - 40
  const wide = gutter >= 200
  const width = wide ? Math.min(300, gutter) : Math.min(320, p.width)
  const x = wide ? p.right + 28 : 0
  const markerX = Math.min(p.right + 6, v.right - 26)
  raw.sort((a, b) => a.anchorTop - b.anchorTop || a.index - b.index)
  const h = (pl: Placement): number => heights.get(pl.item.id) ?? DEFAULT_H
  /* Active card sits exactly at its text; neighbours flow away from it. */
  let pivot = raw.findIndex((pl) => pl.item.id === active)
  if (pivot < 0) pivot = 0
  for (let i = pivot + 1; i < raw.length; i++) {
    const prev = raw[i - 1]!
    raw[i]!.top = Math.max(raw[i]!.anchorTop, prev.top + h(prev) + CARD_GAP)
  }
  for (let i = pivot - 1; i >= 0; i--) {
    const next = raw[i + 1]!
    raw[i]!.top = Math.min(raw[i]!.anchorTop, next.top - h(raw[i]!) - CARD_GAP)
  }
  return { wide, x, width, markerX, proseLeft: p.left, proseRight: p.right, clip: v, placements: raw }
}

const Card = memo(function Card({
  item, index, active, focus, review, onActivate, onDeactivate, onHeight,
}: {
  item: ReviewItem
  index: number
  active: boolean
  focus: boolean
  review: ReviewStore
  onActivate: (id: number) => void
  onDeactivate: () => void
  onHeight: (id: number, h: number) => void
}) {
  const meta = KINDS[item.kind]
  const ref = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)
  const [menu, setMenu] = useState(false)

  useLayoutEffect(() => {
    if (ref.current) onHeight(item.id, ref.current.offsetHeight)
  })
  useEffect(() => {
    if (focus && area.current) {
      area.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when a focus request arrives
  }, [focus])
  /* Grow the field with its text. */
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = Math.min(160, el.scrollHeight) + 'px'
  }, [item.note, active])

  const discardIfEmpty = (): void => {
    if (meta.needsNote && item.note.trim().length === 0) review.remove(item.id)
  }

  const missing = meta.needsNote && item.note.trim().length === 0
  const showField = active || item.note.length > 0 || missing

  return (
    <div
      ref={ref}
      className="dsr-card"
      data-kind={item.kind}
      data-active={active}
      onMouseDown={() => onActivate(item.id)}
      onBlur={(e) => {
        if (ref.current && e.relatedTarget instanceof Node && ref.current.contains(e.relatedTarget)) return
        setMenu(false)
        discardIfEmpty()
      }}
    >
      <div className="dsr-card-head">
        <button type="button" className="dsr-kind-chip" onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu}>
          <Icon name={item.kind} size={13} />
          <span>{meta.label}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <span className="dsr-card-num">{index + 1}</span>
        <button type="button" className="dsr-icon-btn dsr-card-del" aria-label="删除批注" title="删除批注" onClick={() => review.remove(item.id)}>
          <Icon name="trash" size={14} />
        </button>
      </div>
      {menu ? (
        <div className="dsr-menu" role="menu">
          {KIND_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="menuitemradio"
              aria-checked={k === item.kind}
              data-kind={k}
              className="dsr-menu-item"
              onClick={() => {
                review.update(item.id, { kind: k })
                setMenu(false)
                area.current?.focus()
              }}
            >
              <Icon name={k} size={14} />
              <span>{KINDS[k].label}</span>
              {k === item.kind ? <Icon name="check" size={13} /> : null}
            </button>
          ))}
        </div>
      ) : null}
      {showField ? (
        <textarea
          ref={area}
          className="dsr-card-text"
          rows={1}
          value={item.note}
          placeholder={meta.placeholder}
          onFocus={() => onActivate(item.id)}
          onChange={(e) => review.update(item.id, { note: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              discardIfEmpty()
              e.currentTarget.blur()
              onDeactivate()
            } else if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              e.currentTarget.blur()
              onDeactivate()
            }
          }}
        />
      ) : null}
      {missing && !active ? <div className="dsr-card-warn">还没填写内容</div> : null}
    </div>
  )
})

export const ReviewLayer = memo(function ReviewLayer({ review, painter, trackDock, onFocusRequest, useInput, inputActions }: ReviewLayerProps) {
  const view = useSyncExternalStore(review.subscribe, review.getSnapshot)
  const draft = useInput((s) => s.draft)
  const occurrences = useInput((s) => s.occurrences)
  const phase = useInput((s) => s.phase)
  const tick = useLayoutTick(painter)
  const marginHost = usePortalHost('dsr-margin-host')
  const barHost = usePortalHost('dsr-bar-host')
  const anchor = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [overallOpen, setOverallOpen] = useState(false)
  const heights = useRef(new Map<number, number>()).current
  const [, setMeasured] = useState(0)

  useEffect(() => trackDock(), [trackDock])
  useEffect(() => painter.show(view.items), [painter, view.items])
  useEffect(() => () => painter.show([]), [painter])
  useEffect(() => painter.setActive(active), [painter, active])

  useEffect(
    () =>
      onFocusRequest(({ id, focus }) => {
        setActive(id)
        setFocusId(focus ? id : null)
      }),
    [onFocusRequest],
  )

  /* Click on marked text activates its card; clicking elsewhere in the chat deactivates. */
  useEffect(() => {
    const onClick = (e: MouseEvent): void => {
      /* Ignore our own UI, including toolbar buttons already removed by their own click. */
      if (e.target instanceof Node && !e.target.isConnected) return
      if (e.target instanceof Element && e.target.closest('[data-dsr-ui],[data-dsr-doc]')) return
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed) return
      const hit = painter.hitTest(e.clientX, e.clientY)
      setActive(hit)
      setFocusId(null)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [painter])

  const onHeight = useCallback((id: number, h: number) => {
    if (heights.get(id) !== h) {
      heights.set(id, h)
      setMeasured((m) => m + 1)
    }
  }, [heights])
  const onActivate = useCallback((id: number) => setActive(id), [])
  const onDeactivate = useCallback(() => {
    setActive(null)
    setFocusId(null)
  }, [])

  const count = view.items.length
  const visible = count > 0 || view.overall.trim().length > 0
  const layout = marginHost && count > 0 ? computeLayout(view.items, painter, heights, active) : null
  void tick

  const incomplete = incompleteItems(view)
  const canSend = isSendable(view) && phase === 'plain'
  const send = (mode: ReviewMode): void => {
    inputActions.setDraft(composeReview(view, flattenDraft(draft, occurrences), mode))
    inputActions.submit()
    review.clear()
    setActive(null)
    setOverallOpen(false)
  }
  const jumpToIncomplete = (): void => {
    const first = incomplete[0] ?? view.items[0]
    if (!first) return
    painter.reveal(first)
    setActive(first.id)
    setFocusId(first.id)
  }

  /* Margin layer. */
  let margin: JSX.Element | null = null
  if (layout) {
    const c = layout.clip
    const top = Math.max(0, c.top)
    const right = Math.min(window.innerWidth, c.right)
    const bottom = Math.min(window.innerHeight, c.bottom)
    const left = Math.max(0, c.left)
    // The host has no native hit-test area. Pixel coordinates keep clipping its
    // fixed-position children to the chat viewport without a full-window box.
    const clip = `polygon(${left}px ${top}px,${right}px ${top}px,${right}px ${bottom}px,${left}px ${bottom}px)`
    margin = (
      <div className="dsr-margin" style={{ clipPath: clip }}>
        {layout.placements.map((pl) => {
          const isActive = pl.item.id === active
          if (!layout.wide && !isActive) {
            return (
              <button
                key={pl.item.id}
                type="button"
                className="dsr-marker"
                data-kind={pl.item.kind}
                style={{ left: layout.markerX, top: pl.anchorTop }}
                onClick={() => setActive(pl.item.id)}
                aria-label={'批注 ' + (pl.index + 1)}
              >
                {pl.index + 1}
              </button>
            )
          }
          return (
            <div
              key={pl.item.id}
              className="dsr-slot"
              data-wide={layout.wide}
              style={
                layout.wide
                  ? { left: layout.x - (isActive ? 10 : 0), top: pl.top, width: layout.width }
                  : {
                      /* No margin: float the card just under its passage, inside the text column. */
                      left: Math.min(Math.max(pl.anchorLeft, layout.proseLeft), layout.proseRight - layout.width),
                      top: pl.anchorBottom + 8,
                      width: layout.width,
                    }
              }
            >
              <Card
                item={pl.item}
                index={pl.index}
                active={isActive}
                focus={focusId === pl.item.id}
                review={review}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                onHeight={onHeight}
              />
            </div>
          )
        })}
      </div>
    )
  }

  /* Send bar, floating just above the composer. */
  let bar: JSX.Element | null = null
  if (visible && anchor.current) {
    const r = anchor.current.getBoundingClientRect()
    bar = (
      <div className="dsr-sendbar-wrap" style={{ left: r.left + r.width / 2, bottom: window.innerHeight - r.top + 10 }}>
        {overallOpen ? (
          <div className="dsr-overall-pop">
            <div className="dsr-overall-title">整体意见</div>
            <textarea
              autoFocus
              className="dsr-overall-text"
              value={view.overall}
              placeholder="对整篇的看法，比如：整体太长、语气太正式…"
              onChange={(e) => review.setOverall(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing)) {
                  e.preventDefault()
                  setOverallOpen(false)
                }
              }}
            />
          </div>
        ) : null}
        <div className="dsr-sendbar">
          <button type="button" className="dsr-sb-count" onClick={jumpToIncomplete} title="定位批注">
            <Icon name="comment" size={14} />
            <span>{count} 条批注</span>
          </button>
          {incomplete.length > 0 ? <span className="dsr-sb-warn">{incomplete.length} 条未填写</span> : null}
          <span className="dsr-sb-sep" />
          <button type="button" className="dsr-sb-ghost" data-on={overallOpen || view.overall.trim().length > 0} onClick={() => setOverallOpen(!overallOpen)}>
            <Icon name="note" size={14} />
            <span>整体意见</span>
          </button>
          <button type="button" className="dsr-sb-ghost" onClick={() => { review.clear(); setActive(null); setOverallOpen(false) }}>
            清空
          </button>
          <span className="dsr-sb-sep" />
          <button type="button" className="dsr-sb-btn" disabled={!canSend} onClick={() => send('discuss')} title="模型逐条回应每条批注">
            逐条回应
          </button>
          <button type="button" className="dsr-sb-btn dsr-sb-primary" disabled={!canSend} onClick={() => send('revise')} title="模型按批注输出修订后的完整版本">
            出修订版
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={anchor} className="dsr-anchor" data-dsr-ui="true">
      {marginHost && margin ? createPortal(margin, marginHost) : null}
      {barHost && bar ? createPortal(bar, barHost) : null}
    </div>
  )
})
