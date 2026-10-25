/**
 * Character anchors inside the reading document. An anchor is a [start, end)
 * offset pair into the flattened text of the document root plus the quoted
 * text; when the document re-renders (an agent edit, an undo) anchors are
 * re-resolved by searching the quote nearest to its old position.
 */

export interface Anchor {
  readonly start: number
  readonly end: number
  readonly quote: string
}

interface Flat {
  readonly text: string
  readonly nodes: readonly Text[]
  /** Flat offset at which each node starts. */
  readonly starts: readonly number[]
}

export function flatten(root: Element): Flat {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  const starts: number[] = []
  let text = ''
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    nodes.push(n)
    starts.push(text.length)
    text += n.data
  }
  return { text, nodes, starts }
}

/** Flat offset of a DOM boundary point inside root, or null when outside. */
export function offsetOf(root: Element, node: Node, offset: number): number | null {
  if (!root.contains(node)) return null
  const flat = flatten(root)
  if (node.nodeType === Node.TEXT_NODE) {
    const i = flat.nodes.indexOf(node as Text)
    return i < 0 ? null : flat.starts[i]! + offset
  }
  /* Element boundary: count the text that precedes child #offset. */
  const r = document.createRange()
  r.setStart(root, 0)
  r.setEnd(node, offset)
  return r.toString().length
}

export function rangeOf(root: Element, start: number, end: number): Range | null {
  const flat = flatten(root)
  if (flat.nodes.length === 0 || end <= start) return null
  const locate = (pos: number, preferNext: boolean): [Text, number] | null => {
    for (let i = 0; i < flat.nodes.length; i++) {
      const s = flat.starts[i]!
      const e = s + flat.nodes[i]!.data.length
      if (pos < e || (pos === e && !preferNext) || i === flat.nodes.length - 1) {
        if (pos >= s) return [flat.nodes[i]!, Math.min(pos - s, flat.nodes[i]!.data.length)]
      }
    }
    return null
  }
  const a = locate(start, true)
  const b = locate(end, false)
  if (!a || !b) return null
  const range = document.createRange()
  range.setStart(a[0], a[1])
  range.setEnd(b[0], b[1])
  return range
}

const squash = (s: string): string => s.replace(/\s+/g, '')

/** Re-resolve an anchor against the current DOM; null when the quote is gone. */
export function resolve(root: Element, anchor: Anchor): Anchor | null {
  const flat = flatten(root)
  const target = squash(anchor.quote)
  if (!target) return null
  if (squash(flat.text.slice(anchor.start, anchor.end)) === target) return anchor
  /* Whitespace-insensitive search; pick the match closest to the old start. */
  let squashed = ''
  const map: number[] = []
  for (let i = 0; i < flat.text.length; i++) {
    if (/\s/.test(flat.text[i]!)) continue
    squashed += flat.text[i]
    map.push(i)
  }
  let best: Anchor | null = null
  let bestDist = Infinity
  for (let at = squashed.indexOf(target); at >= 0; at = squashed.indexOf(target, at + 1)) {
    const start = map[at]!
    const end = map[at + target.length - 1]! + 1
    const dist = Math.abs(start - anchor.start)
    if (dist < bestDist) {
      best = { start, end, quote: anchor.quote }
      bestDist = dist
    }
  }
  return best
}

export const overlaps = (a: Anchor, b: Anchor): boolean => a.start < b.end && b.start < a.end

export const covers = (a: Anchor, pos: number): boolean => pos >= a.start && pos < a.end

export function shorten(s: string, n: number): string {
  const t = String(s || '').replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

/** Rough Markdown → plain text, for locating edited passages in the rendered doc. */
export function plainOf(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .trim()
}
