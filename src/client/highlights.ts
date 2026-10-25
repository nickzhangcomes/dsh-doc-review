/**
 * In-place marks on the reply, drawn with the CSS Custom Highlight API so the
 * chat's own DOM is never mutated (dsh exposes no slot inside the assistant
 * body, and React re-renders would wipe injected spans). Ranges are cached
 * per item and re-anchored by text search when the chat re-renders.
 */
import type { ReviewItem, ReviewKind } from './model.ts'
import { KINDS } from './model.ts'

const ROW_ATTR = 'data-chat-flow-key'

interface HighlightRegistry {
  set(name: string, value: unknown): void
  delete(name: string): void
}
declare const Highlight: { new (...ranges: Range[]): unknown } | undefined

const registry = (): HighlightRegistry | null => {
  const css = (globalThis as { CSS?: { highlights?: HighlightRegistry } }).CSS
  return css?.highlights && typeof Highlight !== 'undefined' ? css.highlights : null
}

const highlightName = (kind: ReviewKind): string => 'dsr-' + kind

/** Row element for a chat-flow key, if rendered. */
export function rowElement(rowKey: string | null): Element | null {
  if (!rowKey) return null
  try {
    return document.querySelector('[' + ROW_ATTR + '="' + CSS.escape(rowKey) + '"]')
  } catch {
    return null
  }
}

/** Chat-flow row key enclosing a node, or null when outside the chat. */
export function rowKeyOf(node: Node | null): string | null {
  const el = node ? (node.nodeType === 1 ? (node as Element) : node.parentElement) : null
  return el?.closest('[' + ROW_ATTR + ']')?.getAttribute(ROW_ATTR) ?? null
}

/** Rendered markdown body enclosing a node. */
export function proseElement(node: Node | null): Element | null {
  const el = node ? (node.nodeType === 1 ? (node as Element) : node.parentElement) : null
  return el?.closest('[class*="markdown"]') ?? null
}

/** Nearest vertically scrolling ancestor (the chat viewport). */
export function scrollParent(el: Element | null): Element | null {
  for (let e = el?.parentElement ?? null; e; e = e.parentElement) {
    const oy = getComputedStyle(e).overflowY
    if ((oy === 'auto' || oy === 'scroll') && e.scrollHeight > e.clientHeight) return e
  }
  return null
}

/**
 * Find `quote` inside `root`, ignoring whitespace differences (a selection's
 * toString() inserts newlines between blocks that text nodes do not carry).
 */
export function findTextRange(root: Element, quote: string): Range | null {
  const target = quote.replace(/\s+/g, '')
  if (!target) return null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let flat = ''
  const map: { node: Text; offset: number }[] = []
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    const parent = n.parentElement
    if (parent && parent.closest('script,style,[data-dsr-ui]')) continue
    const text = n.data
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i]!)) continue
      flat += text[i]
      map.push({ node: n, offset: i })
    }
  }
  const at = flat.indexOf(target)
  if (at < 0) return null
  const start = map[at]!
  const end = map[at + target.length - 1]!
  const range = document.createRange()
  range.setStart(start.node, start.offset)
  range.setEnd(end.node, end.offset + 1)
  return range
}

/** Owns the live ranges of the visible session and paints them. */
export class HighlightPainter {
  private readonly ranges = new Map<number, Range>()
  private items: readonly ReviewItem[] = []
  private active: number | null = null
  private pending = 0
  private readonly observer: MutationObserver
  private readonly listeners = new Set<() => void>()

  constructor() {
    this.observer = new MutationObserver((records) => {
      if (records.every((r) => (r.target as Element).closest?.('[data-dsr-ui],[data-dsr-doc]'))) return
      this.schedule()
    })
    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  }

  /** Notified after every repaint (layout may have moved). */
  onPaint(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  seed(id: number, range: Range): void {
    this.ranges.set(id, range)
  }

  show(items: readonly ReviewItem[]): void {
    this.items = items
    const live = new Set(items.map((i) => i.id))
    for (const id of [...this.ranges.keys()]) if (!live.has(id)) this.ranges.delete(id)
    if (this.active !== null && !live.has(this.active)) this.active = null
    this.paint()
  }

  setActive(id: number | null): void {
    if (this.active === id) return
    this.active = id
    this.paint()
  }

  /** Range for an item, re-anchored if the DOM moved under it. */
  rangeFor(item: ReviewItem): Range | null {
    const cached = this.ranges.get(item.id)
    if (cached && !cached.collapsed && cached.startContainer.isConnected && cached.endContainer.isConnected) {
      if (cached.toString().replace(/\s+/g, '') === item.quote.replace(/\s+/g, '')) return cached
    }
    const root = rowElement(item.rowKey) ?? document.querySelector('[' + ROW_ATTR + ']')?.parentElement ?? null
    const found = root ? findTextRange(root, item.quote) : null
    if (found) this.ranges.set(item.id, found)
    else this.ranges.delete(item.id)
    return found
  }

  /** The item whose marked text lies under a viewport point. */
  hitTest(x: number, y: number): number | null {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]!
      const range = this.ranges.get(item.id)
      if (!range) continue
      for (const r of range.getClientRects()) {
        if (x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 1 && y <= r.bottom + 1) return item.id
      }
    }
    return null
  }

  /** Scroll the passage to the middle of the viewport. */
  reveal(item: ReviewItem): boolean {
    const range = this.rangeFor(item)
    if (!range) return false
    range.startContainer.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    return true
  }

  private schedule(): void {
    if (this.pending) return
    this.pending = window.requestAnimationFrame(() => {
      this.pending = 0
      this.paint()
    })
  }

  private paint(): void {
    const reg = registry()
    if (reg) {
      const byKind = new Map<ReviewKind, Range[]>()
      let activeRange: Range | null = null
      for (const item of this.items) {
        const range = this.rangeFor(item)
        if (!range) continue
        if (item.id === this.active) activeRange = range
        const list = byKind.get(item.kind) ?? []
        list.push(range)
        byKind.set(item.kind, list)
      }
      for (const kind of Object.keys(KINDS) as ReviewKind[]) {
        const list = byKind.get(kind)
        if (list && list.length) reg.set(highlightName(kind), new Highlight!(...list))
        else reg.delete(highlightName(kind))
      }
      if (activeRange) reg.set('dsr-active', new Highlight!(activeRange))
      else reg.delete('dsr-active')
    }
    for (const fn of this.listeners) fn()
  }

  dispose(): void {
    this.observer.disconnect()
    if (this.pending) window.cancelAnimationFrame(this.pending)
    const reg = registry()
    if (reg) {
      for (const kind of Object.keys(KINDS) as ReviewKind[]) reg.delete(highlightName(kind))
      reg.delete('dsr-active')
    }
    this.listeners.clear()
  }
}
