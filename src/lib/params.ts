import { SCHEME_TYPES, schemeNames, type SchemeType } from '@/data/schemes'

export const MAX_CLASSES = 50
export const DEFAULT_CLASSES = 6

export interface Params {
  type: SchemeType
  scheme: string
  n: number
  reversed: boolean
}

/** A whole number from 1 to MAX_CLASSES; anything else gives the default. */
export function clampClasses(value: unknown): number {
  const n = parseInt(String(value), 10)
  if (!(n >= 1)) return DEFAULT_CLASSES
  return Math.min(n, MAX_CLASSES)
}

/**
 * Resolve type, scheme, class count and reverse from a URL query string.
 * Anything invalid falls back to a default (type -> sequential, scheme -> first of the type).
 */
export function parseParams(search: string): Params {
  const q = new URLSearchParams(search)

  let typeParam = q.get('type') || 'sequential'
  if (typeParam === 'cyclical') typeParam = 'cyclic'
  const type: SchemeType = (SCHEME_TYPES as readonly string[]).includes(typeParam)
    ? (typeParam as SchemeType)
    : 'sequential'

  const schemeParam = q.get('scheme')
  const scheme = schemeParam !== null && schemeNames[type].includes(schemeParam) ? schemeParam : schemeNames[type][0]

  return { type, scheme, n: clampClasses(q.get('n')), reversed: q.get('reverse') === '1' }
}

/** The share URL for a selection: base + ?type=..&scheme=..&n=..[&reverse=1]. */
export function buildUrl(base: string, p: Params): string {
  const clean = base.split('#')[0].split('?')[0]
  return `${clean}?type=${p.type}&scheme=${p.scheme}&n=${p.n}${p.reversed ? '&reverse=1' : ''}`
}
