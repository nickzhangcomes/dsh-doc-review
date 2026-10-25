/**
 * The agent behind document-mode threads: ONE child session per reading,
 * forked from the conversation (so it knows everything the reply knew), shared
 * by every thread (so threads can refer to each other). Each comment that asks
 * for a reply is prompted into the child with a request token; the reply is
 * read back from the child's chat projection by locating that token.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- runtime services are untyped */

export interface AgentDeps {
  readonly sessions: any
  readonly uiConversation: any
  readonly workspaces: any
}

export interface AgentReply {
  /** The request's user turn has reached the child's transcript. */
  readonly seen: boolean
  readonly text: string
  readonly done: boolean
  readonly error: string | null
}

const textOf = (content: unknown): string =>
  (Array.isArray(content) ? content : [])
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('\n')

export const tokenTag = (token: string): string => '【评论 ' + token + '】'

export class AgentChannel {
  private child: string | null = null
  private creating: Promise<string> | null = null
  private handle: any = null
  private target: any = null
  private unsubscribe: (() => void) | null = null
  private counter = 0
  private disposed = false
  private readonly listeners = new Set<() => void>()

  constructor(
    private readonly deps: AgentDeps,
    private readonly parentId: string,
    private readonly title: string,
  ) {}

  /** True once the child exists (its first prompt carries the preamble). */
  get started(): boolean {
    return this.child !== null
  }

  nextToken(): string {
    this.counter += 1
    return 'r' + this.counter
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private async ensure(): Promise<string> {
    if (this.child) return this.child
    if (!this.creating) {
      this.creating = (async () => {
        const { sessions, uiConversation } = this.deps
        const child: string = await sessions.fork({ sessionId: this.parentId })
        if (!child) throw new Error('无法创建文档模式会话')
        rememberChild(child)
        this.handle = sessions.retain(child, { source: 'dsh-doc-review' })
        try {
          await this.handle?.ready
        } catch {
          /* readiness is advisory */
        }
        const actx = sessions.scope(child)
        const session = actx ? sessions.sessionOf(actx) : undefined
        if (session && typeof session.open === 'function') await session.open()
        const binding = sessions.binding(child)
        Promise.resolve(binding?.session?.rename?.('文档模式 · ' + this.title)).catch(() => {})
        this.target = uiConversation.binding(child).target('chat')
        this.unsubscribe = this.target.subscribe(() => this.emit())
        this.child = child
        if (this.disposed) this.dispose()
        return child
      })()
      this.creating.catch(() => {
        this.creating = null
      })
    }
    return this.creating
  }

  private emit(): void {
    for (const fn of this.listeners) fn()
  }

  /** Prompt the child; the text must contain tokenTag(token). */
  async send(text: string): Promise<void> {
    const child = await this.ensure()
    const binding = this.deps.sessions.binding(child)
    if (!binding?.session?.prompt) throw new Error('文档模式会话不可用')
    const result = await binding.session.prompt([{ type: 'text', text }], 'queue')
    if (result && result.ok === false) throw new Error('发送失败：' + (result.error?.code ?? 'unknown'))
    this.emit()
  }

  read(token: string): AgentReply {
    const none: AgentReply = { seen: false, text: '', done: false, error: null }
    if (!this.target) return none
    const snap = this.target.getSnapshot()
    const order: unknown[] = Array.isArray(snap?.order) ? snap.order : []
    const nodes = order.map((k) => snap.nodes.get(k)).filter(Boolean)
    const tag = tokenTag(token)
    let i = nodes.findIndex((n: any) => n.kind === 'user' && textOf(n.data?.content).includes(tag))
    if (i < 0) return none
    const parts: string[] = []
    let done = false
    let interrupted = false
    for (i = i + 1; i < nodes.length; i++) {
      const n: any = nodes[i]
      if (n.kind === 'user') {
        done = true
        break
      }
      if (n.kind === 'assistant-step') {
        const blocks: any[] = Array.isArray(n.data?.blocks) ? n.data.blocks : []
        const t = blocks.filter((b) => b && b.kind === 'text' && typeof b.text === 'string').map((b) => b.text).join('\n')
        if (t) parts.push(t)
        if (n.data?.status === 'interrupted') interrupted = true
      }
      if (n.kind === 'turn-tail') {
        done = true
        break
      }
    }
    const text = parts.join('\n\n')
    let error: string | null = null
    if (done && interrupted && !text) error = '回复被中断了'
    else if (done && !text) {
      const s = this.deps.sessions.binding(this.child)?.session?.getSnapshot?.()
      error = s?.lastAgentError ? '回复失败：' + String(s.lastAgentError.message ?? s.lastAgentError.code ?? s.lastAgentError) : '没有收到回复'
    }
    return { seen: true, text, done, error }
  }

  /** Stop and archive the child; the reading's threads stay in the document. */
  dispose(): void {
    this.disposed = true
    this.unsubscribe?.()
    this.unsubscribe = null
    const child = this.child
    if (!child) return
    this.child = null
    this.listeners.clear()
    const handle = this.handle
    void retireChild(this.deps, child).finally(() => {
      try {
        handle?.releaseReference?.()
      } catch {
        /* advisory */
      }
    })
  }
}

/* ---------- side-session bookkeeping ---------- */

const CHILDREN_KEY = 'dsh-review:children'

function readChildren(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(CHILDREN_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeChildren(ids: string[]): void {
  try {
    window.localStorage.setItem(CHILDREN_KEY, JSON.stringify([...new Set(ids)]))
  } catch {
    /* best effort */
  }
}

/** Side sessions owned by an open reading right now (never swept). */
const liveChildren = new Set<string>()

export function rememberChild(id: string): void {
  liveChildren.add(id)
  writeChildren([...readChildren(), id])
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Cancel (and wait for) a running turn, then archive; retried, and forgotten only once archived. */
export async function retireChild(deps: AgentDeps, child: string): Promise<boolean> {
  liveChildren.delete(child)
  const { sessions, workspaces } = deps
  try {
    const s = sessions.binding(child)?.session
    if (s?.getSnapshot?.()?.running) {
      await Promise.race([Promise.resolve(s.cancel()), sleep(3000)]).catch(() => {})
      for (let i = 0; i < 20 && s.getSnapshot?.()?.running; i++) await sleep(150)
    }
  } catch {
    /* advisory */
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await workspaces?.archiveSession?.(child)
      if (!(r && r.ok === false)) {
        writeChildren(readChildren().filter((x) => x !== child))
        return true
      }
    } catch (err) {
      if (attempt === 3) console.error('[dsh-doc-review] could not archive side session', child, err)
    }
    await sleep(800 * (attempt + 1))
  }
  return false
}

/** Archive side sessions left behind by an earlier reading (crash, closed tab, failed archive). */
export async function sweepChildren(deps: AgentDeps): Promise<void> {
  for (const id of readChildren()) if (!liveChildren.has(id)) await retireChild(deps, id)
}
