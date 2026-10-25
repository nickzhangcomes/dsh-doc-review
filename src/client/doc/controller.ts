/**
 * Ties a reading document to its agent: sends thread comments into the shared
 * child session, streams replies back into the thread, and applies the edits
 * the agent proposes (with undo / redo).
 */
import { AgentChannel, tokenTag, type AgentDeps } from './agent.ts'
import { applyEdit, undoEdit, type DocStore, type Thread } from './store.ts'
import { plainOf } from './anchor.ts'

const EDIT_FENCE = /```dsh-edit[^\n]*\n([\s\S]*?)```/

/** Reply text as shown in the thread: the edit block is machinery, not prose. */
export function visibleReply(text: string): string {
  const i = text.indexOf('```dsh-edit')
  return (i >= 0 ? text.slice(0, i) : text).trim()
}

function parseEdit(text: string): { find: string; replace: string } | null {
  const m = EDIT_FENCE.exec(text)
  if (!m) return null
  try {
    const obj = JSON.parse(m[1]!.trim()) as { find?: unknown; replace?: unknown }
    if (typeof obj.find !== 'string' || !obj.find) return null
    return { find: obj.find, replace: typeof obj.replace === 'string' ? obj.replace : '' }
  } catch {
    return null
  }
}

const PREAMBLE = [
  '【文档模式】我正在把你在这个对话里的一条回复（全文附在下面）当作一份文档阅读，并在文档里的具体段落旁留评论。接下来我发的每条消息都是一条这样的评论，请遵守：',
  '1. 像文档评论区里的回复一样简短直接（通常 1～4 句），不要复述我的评论，不要寒暄，不要输出整篇文档。',
  '2. 只有当我明确要求修改正文（改写、删掉、补充、精简、换个说法等）时才修改。修改时先用一句话说明改了什么，再在回复末尾附上一个代码块：',
  '```dsh-edit',
  '{"find": "要被替换的原文片段，必须与下方当前文档逐字一致", "replace": "替换后的文本，删除就写空字符串"}',
  '```',
  '   find 要短而唯一，通常是我选中的文字或它所在的整句；replace 保持原有的 Markdown 格式。一次回复最多一个 dsh-edit 块。',
  '3. 所有评论共享这一个上下文，可以引用之前的讨论。',
].join('\n')

const quoteBlock = (s: string): string =>
  s.trim().split(/\r?\n/).filter((l) => l.trim()).map((l) => '> ' + l).join('\n')

interface Pending {
  readonly threadId: number
  readonly msgId: number
  readonly token: string
}

export class DocController {
  readonly channel: AgentChannel
  private sentVersion = -1
  private readonly pending: Pending[] = []
  /** Comments left without asking the agent, delivered as context with the next ask. */
  private silent: { quote: string; text: string }[] = []
  private readonly off: () => void

  constructor(
    readonly store: DocStore,
    deps: AgentDeps,
  ) {
    const s = store.getSnapshot()
    this.channel = new AgentChannel(deps, s.sessionId, s.title)
    this.off = this.channel.onChange(() => this.sync())
  }

  dispose(): void {
    this.off()
    this.channel.dispose()
    /* Unfinished replies stop with the child session. */
    for (const p of this.pending) {
      this.store.patchThread(p.threadId, (t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === p.msgId && m.status !== 'done' ? { ...m, status: 'error' as const, text: m.text || '（已退出文档模式，回复中止）' } : m)),
      }))
    }
    this.pending.length = 0
  }

  get busy(): boolean {
    return this.pending.length > 0
  }

  /** Post the thread's composer text; ask the agent when the toggle (or @Agent) says so. */
  send(threadId: number): void {
    const t = this.store.thread(threadId)
    if (!t) return
    const text = t.input.trim()
    if (!text) return
    const ask = t.askOn || /@agent/i.test(text)
    const userId = this.store.allocate()
    const agentId = ask ? this.store.allocate() : -1
    this.store.patchThread(threadId, (x) => ({
      ...x,
      draft: false,
      input: '',
      messages: [...x.messages, { id: userId, role: 'user' as const, text }, ...(ask ? [{ id: agentId, role: 'agent' as const, text: '', status: 'pending' as const }] : [])],
    }))
    if (!ask) {
      this.silent.push({ quote: t.quote, text })
      return
    }
    const token = this.channel.nextToken()
    const prompt = this.compose(this.store.thread(threadId)!, text, token)
    this.pending.push({ threadId, msgId: agentId, token })
    this.channel.send(prompt).catch((err: unknown) => {
      this.finish(threadId, agentId, token, '', String((err as Error)?.message ?? err))
    })
  }

  private compose(t: Thread, text: string, token: string): string {
    const s = this.store.getSnapshot()
    const parts: string[] = []
    if (!this.channel.started && this.sentVersion < 0) {
      parts.push(PREAMBLE)
      /* Re-entering a document forks a fresh session: carry the earlier threads over. */
      const earlier = s.threads
        .filter((x) => !x.draft && x.messages.length > 0)
        .map((x) => {
          const msgs = x.id === t.id ? x.messages.slice(0, -2) : x.messages
          const said = msgs
            .filter((m) => m.text && m.status !== 'error')
            .map((m) => (m.role === 'user' ? '我：' : 'Agent：') + visibleReply(m.text).replace(/\s+/g, ' ').slice(0, 300))
          if (!said.length) return ''
          const state = x.resolved ? '（已解决）' : x.edit?.status === 'applied' ? '（已改正文）' : x.edit?.status === 'undone' ? '（改动已撤销）' : ''
          return '- 「' + x.quote.replace(/\s+/g, ' ').slice(0, 60) + '」' + state + '\n  ' + said.join('\n  ')
        })
        .filter(Boolean)
      if (earlier.length) parts.push('之前在这份文档里已有的评论讨论（供参考）：\n' + earlier.join('\n'))
      /* Silent comments are already part of that list. */
      this.silent = []
    }
    if (s.version !== this.sentVersion) {
      parts.push((this.sentVersion < 0 ? '当前文档（Markdown）：' : '（文档已更新，当前全文如下）') + '\n<document>\n' + s.markdown + '\n</document>')
      this.sentVersion = s.version
    }
    if (this.silent.length) {
      parts.push('此前我还留下了这些评论（不需要单独回复）：\n' + this.silent.map((x) => '- 「' + x.quote + '」：' + x.text).join('\n'))
      this.silent = []
    }
    const asked = t.messages.filter((m) => m.role === 'user').length > 1
    parts.push(
      tokenTag(token) + (asked ? '（同一条评论下的追问）' : '') + '\n选中的文字：\n' + quoteBlock(t.quote) + '\n我的评论：' + text.replace(/@agent/gi, '').trim(),
    )
    return parts.join('\n\n')
  }

  private sync(): void {
    for (const p of [...this.pending]) {
      const r = this.channel.read(p.token)
      if (!r.seen) continue
      if (r.done) this.finish(p.threadId, p.msgId, p.token, r.text, r.error)
      else
        this.store.patchThread(p.threadId, (t) => ({
          ...t,
          messages: t.messages.map((m) => (m.id === p.msgId ? { ...m, text: r.text, status: r.text ? ('streaming' as const) : ('pending' as const) } : m)),
        }))
    }
  }

  private finish(threadId: number, msgId: number, token: string, text: string, error: string | null): void {
    const i = this.pending.findIndex((p) => p.token === token)
    if (i < 0) return
    this.pending.splice(i, 1)
    this.store.patchThread(threadId, (t) => ({
      ...t,
      messages: t.messages.map((m) => (m.id === msgId ? { ...m, text: error && !text ? error : text, status: error && !text ? ('error' as const) : ('done' as const) } : m)),
    }))
    const edit = text ? parseEdit(text) : null
    if (edit) this.apply(threadId, edit.find, edit.replace)
  }

  private apply(threadId: number, find: string, replace: string): void {
    const s = this.store.getSnapshot()
    const res = applyEdit(s.markdown, find, replace)
    if (!res) {
      this.store.patchThread(threadId, (t) => ({ ...t, edit: { find, replace, at: -1, status: 'failed' } }))
      return
    }
    this.store.update((st) => ({
      ...st,
      markdown: res.md,
      version: st.version + 1,
      threads: st.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              edit: { find: res.find, replace, at: res.at, status: 'applied' as const },
              /* Re-anchor the thread on the rewritten passage (deletions leave it unanchored). */
              anchor: replace && t.anchor ? { ...t.anchor, quote: plainOf(replace) } : null,
            }
          : t,
      ),
    }))
  }

  undo(threadId: number): void {
    const t = this.store.thread(threadId)
    if (!t?.edit || t.edit.status !== 'applied') return
    const md = undoEdit(this.store.getSnapshot().markdown, t.edit)
    if (md === null) return
    const edit = t.edit
    this.store.update((st) => ({
      ...st,
      markdown: md,
      version: st.version + 1,
      threads: st.threads.map((x) =>
        x.id === threadId ? { ...x, edit: { ...edit, status: 'undone' as const }, anchor: { start: x.anchor?.start ?? edit.at, end: (x.anchor?.start ?? edit.at) + 1, quote: x.quote } } : x,
      ),
    }))
  }

  redo(threadId: number): void {
    const t = this.store.thread(threadId)
    if (!t?.edit || t.edit.status !== 'undone') return
    this.apply(threadId, t.edit.find, t.edit.replace)
  }
}
