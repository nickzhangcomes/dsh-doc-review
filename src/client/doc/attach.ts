/**
 * Reading summaries brought back to the conversation. A summary rides the
 * composer as a reference chip (zero-width label; the card above the composer
 * is its face) and is serialized into the next message by our codec.
 */
import type { SummaryLine } from './store.ts'

export interface Attachment {
  readonly id: string
  readonly sessionId: string
  readonly title: string
  readonly sub: string
  readonly lines: readonly SummaryLine[]
  /** What the model receives. */
  readonly text: string
}

const KEY = 'dsh-review:attach:v1'

class AttachStore {
  private pendingBySession = new Map<string, Attachment>()
  private readonly byId = new Map<string, Attachment>()
  private readonly listeners = new Set<() => void>()
  private version = 0

  constructor() {
    try {
      const raw = window.localStorage.getItem(KEY)
      const list = raw ? (JSON.parse(raw) as Attachment[]) : []
      for (const a of list) if (a && a.id) this.byId.set(a.id, a)
    } catch {
      /* start empty */
    }
  }

  getVersion = (): number => this.version

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  /** Queue a summary for a session's composer (the dock inserts the chip). */
  stage(a: Attachment): void {
    this.pendingBySession.set(a.sessionId, a)
    this.emit()
  }

  pending(sessionId: string): Attachment | undefined {
    return this.pendingBySession.get(sessionId)
  }

  /** The chip landed in the draft. */
  settle(a: Attachment): void {
    this.pendingBySession.delete(a.sessionId)
    this.byId.set(a.id, a)
    this.persist()
    this.emit()
  }

  drop(id: string): void {
    this.byId.delete(id)
    this.persist()
    this.emit()
  }

  get(id: string): Attachment | undefined {
    return this.byId.get(id)
  }

  forSession(sessionId: string): Attachment[] {
    return [...this.byId.values()].filter((a) => a.sessionId === sessionId)
  }

  private persist(): void {
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...this.byId.values()]))
    } catch {
      /* best effort */
    }
  }

  private emit(): void {
    this.version += 1
    for (const fn of this.listeners) fn()
  }
}

export const attachments = new AttachStore()
