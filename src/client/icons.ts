/**
 * Line icons (24×24, 1.75 stroke) shared by the vanilla toolbar and React cards.
 */
import type { ReviewKind } from './model.ts'

export const ICON_PATHS = {
  comment: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  agree: 'M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z',
  disagree: 'M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  note: 'M4 6h16M4 12h16M4 18h10',
  check: 'M20 6 9 17l-5-5',
  doc: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5',
  highlight: 'm9 11-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4',
  x: 'M18 6 6 18M6 6l12 12',
  back: 'M15 18l-6-6 6-6',
  send: 'M12 19V5M5 12l7-7 7 7',
  down: 'm6 9 6 6 6-6',
  up: 'm18 15-6-6-6 6',
} as const satisfies Record<ReviewKind | string, string>

export type IconName = keyof typeof ICON_PATHS

/** SVG markup string for the vanilla DOM toolbar. */
export function iconSvg(name: IconName, size = 16): string {
  return (
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
    ICON_PATHS[name] + '"/></svg>'
  )
}
