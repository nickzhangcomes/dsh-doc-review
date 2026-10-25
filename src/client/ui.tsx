/**
 * Shared React bits: line icons and the shell's own Markdown renderer
 * (falls back to pre-wrapped text if the primitive is unavailable).
 */
import type { ComponentType } from 'react'
import { ICON_PATHS, type IconName } from './icons.ts'

declare const require: (id: string) => unknown

let MarkdownImpl: ComponentType<{ text: string; streaming?: boolean }> | null = null
try {
  MarkdownImpl = (require('@deepseek-ai/dsh-client-ui-primitives') as { MarkdownText?: typeof MarkdownImpl }).MarkdownText ?? null
} catch {
  MarkdownImpl = null
}

export function Markdown({ text, streaming }: { text: string; streaming?: boolean }) {
  if (MarkdownImpl) return <MarkdownImpl text={text} streaming={streaming} />
  return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
}

export const Icon = ({ name, size = 14, width = 1.75 }: { name: IconName; size?: number; width?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICON_PATHS[name]} />
  </svg>
)
