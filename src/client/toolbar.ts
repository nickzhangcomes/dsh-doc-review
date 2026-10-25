/**
 * Selection toolbar, Notion/Feishu style: select prose in a reply and a
 * compact bar floats above it — a primary 评论 button, then icon-only marks
 * (rewrite, insert, delete, expand, verify, keep) with hover tooltips.
 * Every action creates a margin card right away; no intermediate popover.
 */
import { KINDS, QUICK_KINDS, type ReviewKind } from './model.ts'
import { proseElement, rowKeyOf } from './highlights.ts'
import { iconSvg } from './icons.ts'

export interface ToolbarOptions {
  /** Create a mark; returns its id, or null when no session is visible. */
  readonly stage: (kind: ReviewKind, quote: string, rowKey: string | null, range: Range) => number | null
}

interface Captured {
  quote: string
  rowKey: string | null
  range: Range
}

export function createToolbar(opts: ToolbarOptions): () => void {
  const root = document.createElement('div')
  root.className = 'dsr-float-root'
  root.dataset.dsrUi = 'true'
  document.body.appendChild(root)

  let bar: HTMLDivElement | null = null
  let tip: HTMLDivElement | null = null
  let captured: Captured | null = null

  const close = (): void => {
    bar?.remove()
    tip?.remove()
    bar = null
    tip = null
    captured = null
  }

  const capture = (): Captured | null => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
    const range = sel.getRangeAt(0)
    /* Only reply prose: both ends in a rendered markdown body, never chrome. */
    if (!proseElement(range.startContainer) || !proseElement(range.endContainer)) return null
    const rowKey = rowKeyOf(range.startContainer)
    if (rowKey === null) return null
    const quote = sel.toString().trim()
    if (quote.length === 0) return null
    return { quote, rowKey, range: range.cloneRange() }
  }

  const place = (): void => {
    if (!bar || !captured) return
    const rects = captured.range.getClientRects()
    const first = rects[0] ?? captured.range.getBoundingClientRect()
    const w = bar.offsetWidth
    const h = bar.offsetHeight
    const x = Math.min(Math.max(8, first.left), Math.max(8, window.innerWidth - w - 8))
    let y = first.top - h - 8
    if (y < 8) y = captured.range.getBoundingClientRect().bottom + 8
    bar.style.left = x + 'px'
    bar.style.top = y + 'px'
  }

  const showTip = (btn: HTMLElement, text: string): void => {
    tip?.remove()
    const t = document.createElement('div')
    t.className = 'dsr-tip'
    t.textContent = text
    root.appendChild(t)
    const r = btn.getBoundingClientRect()
    t.style.left = Math.max(8, r.left + r.width / 2 - t.offsetWidth / 2) + 'px'
    t.style.top = r.top - t.offsetHeight - 6 + 'px'
    tip = t
  }

  const act = (kind: ReviewKind): void => {
    if (!captured) return
    const id = opts.stage(kind, captured.quote, captured.rowKey, captured.range)
    if (id !== null) window.getSelection()?.removeAllRanges()
    close()
  }

  const button = (kind: ReviewKind, withLabel: boolean): HTMLButtonElement => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = withLabel ? 'dsr-tb-btn dsr-tb-primary' : 'dsr-tb-btn'
    btn.dataset.kind = kind
    btn.setAttribute('aria-label', KINDS[kind].hint)
    btn.innerHTML = iconSvg(kind, withLabel ? 15 : 16) + (withLabel ? '<span>' + KINDS[kind].label + '</span>' : '')
    btn.addEventListener('mousedown', (e) => e.preventDefault())
    btn.addEventListener('click', () => act(kind))
    if (!withLabel) {
      btn.addEventListener('mouseenter', () => showTip(btn, KINDS[kind].hint))
      btn.addEventListener('mouseleave', () => {
        tip?.remove()
        tip = null
      })
    }
    return btn
  }

  const open = (c: Captured): void => {
    bar?.remove()
    captured = c
    const b = document.createElement('div')
    b.className = 'dsr-toolbar'
    b.setAttribute('role', 'toolbar')
    b.appendChild(button('comment', true))
    const sep = document.createElement('span')
    sep.className = 'dsr-tb-sep'
    b.appendChild(sep)
    for (const kind of QUICK_KINDS) b.appendChild(button(kind, false))
    root.appendChild(b)
    bar = b
    place()
  }

  const onMouseUp = (e: MouseEvent): void => {
    if (e.button !== 0) return
    if (e.target instanceof Node && root.contains(e.target)) return
    window.setTimeout(() => {
      const c = capture()
      if (c) open(c)
      else close()
    }, 0)
  }
  const onSelectionChange = (): void => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) close()
  }
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && bar) close()
  }
  const onScroll = (): void => place()

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll)

  return () => {
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('selectionchange', onSelectionChange)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', onScroll)
    root.remove()
  }
}
