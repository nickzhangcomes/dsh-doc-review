/**
 * Review model: the reviewer's marks on a reply, one per-session store, and
 * the composer that turns the marks into one outbound message.
 */

/** Every review action a reviewer can take on a passage. */
export type ReviewKind = 'comment' | 'agree' | 'disagree'

export interface KindMeta {
  readonly label: string
  /** True when the mark is meaningless without text. */
  readonly needsNote: boolean
  /** Placeholder shown in the card's text field. */
  readonly placeholder: string
  /** Prefix for the note line in the outbound message. */
  readonly noteLabel: string
  /** Tooltip in the selection toolbar. */
  readonly hint: string
}

export const KINDS: Record<ReviewKind, KindMeta> = {
  comment: { label: '评论', needsNote: true, placeholder: '写下你的想法、问题，或想怎么改…', noteLabel: '意见', hint: '评论' },
  agree: { label: '认可', needsNote: false, placeholder: '为什么认可（可选）', noteLabel: '理由', hint: '认可：这里讲得对' },
  disagree: { label: '反对', needsNote: false, placeholder: '哪里不认同（可选）', noteLabel: '理由', hint: '反对：这里我不认同' },
}

/** Icon-only toolbar actions after the primary 评论 button. */
export const QUICK_KINDS: readonly ReviewKind[] = ['agree', 'disagree']

export interface ReviewItem {
  readonly id: number
  readonly kind: ReviewKind
  /** The passage as rendered, exactly as selected. */
  readonly quote: string
  readonly note: string
  /** Chat-flow row key the passage was selected in (re-anchors highlights). */
  readonly rowKey: string | null
  readonly createdAt: number
}

/** How the model should handle the batch. */
export type ReviewMode = 'discuss' | 'revise'

export interface ReviewView {
  readonly items: readonly ReviewItem[]
  readonly overall: string
}

const EMPTY: ReviewView = Object.freeze({ items: Object.freeze([]), overall: '' })

const storageKey = (sessionId: string): string => 'dsh-review:v3:' + sessionId

/** Per-session review store; survives reloads through localStorage. */
export class ReviewStore {
  private view: ReviewView = EMPTY
  private nextId = 1
  private readonly listeners = new Set<() => void>()

  constructor(private readonly sessionId: string) {
    try {
      const raw = window.localStorage.getItem(storageKey(sessionId))
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReviewView>
        const items = Array.isArray(parsed.items) ? parsed.items.filter((i) => i && typeof i.quote === 'string' && i.kind in KINDS) : []
        this.view = Object.freeze({ items: Object.freeze(items), overall: typeof parsed.overall === 'string' ? parsed.overall : '' })
        this.nextId = items.reduce((m, i) => Math.max(m, i.id), 0) + 1
      }
    } catch {
      /* storage unavailable or corrupt: start empty */
    }
  }

  getSnapshot = (): ReviewView => this.view

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  add = (kind: ReviewKind, quote: string, note: string, rowKey: string | null): number => {
    const id = this.nextId++
    this.commit({ items: [...this.view.items, { id, kind, quote, note, rowKey, createdAt: Date.now() }] })
    return id
  }

  update = (id: number, patch: Partial<Pick<ReviewItem, 'kind' | 'note'>>): void => {
    this.commit({ items: this.view.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }

  remove = (id: number): void => {
    this.commit({ items: this.view.items.filter((i) => i.id !== id) })
  }

  setOverall = (overall: string): void => this.commit({ overall })

  clear = (): void => this.commit({ items: [], overall: '' })

  private commit(patch: Partial<ReviewView>): void {
    const next = { ...this.view, ...patch }
    this.view = Object.freeze({ ...next, items: Object.freeze([...next.items]) })
    try {
      window.localStorage.setItem(storageKey(this.sessionId), JSON.stringify(this.view))
    } catch {
      /* best effort */
    }
    for (const fn of this.listeners) fn()
  }
}

/** Items whose kind requires words but have none yet. */
export function incompleteItems(view: ReviewView): readonly ReviewItem[] {
  return view.items.filter((i) => KINDS[i.kind].needsNote && i.note.trim().length === 0)
}

export function isSendable(view: ReviewView): boolean {
  if (view.items.length === 0 && view.overall.trim().length === 0) return false
  return incompleteItems(view).length === 0
}

const quoteBlock = (text: string): string =>
  text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0).map((l) => '> ' + l).join('\n')

/** Closes the review block; the chat folds the block into a compact card. */
export const REVIEW_CLOSE = '【/审阅意见】'

const DISCUSS_HEAD = (n: number): string =>
  '【审阅意见】我把你上一条回复当作一份稿子审阅了一遍' + (n > 0 ? '，共 ' + n + ' 条批注' : '') + '。' +
  (n > 0 ? '请按编号逐条回应，每条以「批注 N：」开头，不要合并，也不要遗漏。' : '请根据我的整体意见回应。')

const REVISE_HEAD = (n: number): string =>
  '【审阅意见·请出修订版】我把你上一条回复当作一份稿子审阅了一遍' + (n > 0 ? '，共 ' + n + ' 条批注' : '') + '。请据此输出修订后的完整版本。\n' +
  '处理规则：认可＝保留，可以沿这个方向强化；反对＝重新思考并重写这部分；评论＝按意见调整。\n' +
  '修订版之后，用一个简短列表说明每条批注的处理情况（批注 N：已处理 / 未处理及原因）。'

/**
 * Compose the outbound message.
 * @param view - staged marks.
 * @param draft - whatever the user already typed in the composer (kept first).
 * @param mode - point-by-point discussion or a revised version.
 */
export function composeReview(view: ReviewView, draft: string, mode: ReviewMode): string {
  const n = view.items.length
  const head = mode === 'revise' ? REVISE_HEAD(n) : DISCUSS_HEAD(n)
  const blocks = view.items.map((item, index) => {
    const meta = KINDS[item.kind]
    const lines = ['批注 ' + (index + 1) + '｜' + meta.label, quoteBlock(item.quote)]
    if (item.note.trim()) lines.push(meta.noteLabel + '：' + item.note.trim())
    return lines.join('\n')
  })
  const parts = [head, ...blocks]
  if (view.overall.trim()) parts.push('整体意见：' + view.overall.trim())
  const body = parts.join('\n\n') + '\n' + REVIEW_CLOSE
  const own = draft.trim()
  return own ? own + '\n\n' + body : body
}
