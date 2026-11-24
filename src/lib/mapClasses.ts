/** The diagnostic map only has designed class assignments for this range of classes. */
export const MAP_MIN_CLASSES = 3
export const MAP_MAX_CLASSES = 12

export function isMapRange(n: number): boolean {
  return n >= MAP_MIN_CLASSES && n <= MAP_MAX_CLASSES
}

/** Class index (0-based) on the map for a polygon whose 12-class index is q12, when using n classes. */
export function deriveMapClass(q12: number, n: number): number {
  return Math.floor(((q12 + 0.5) * n) / 12)
}

/**
 * Add "q<c>-<n>" classes to paths that only carry the shipped 3-12 class assignments.
 * `paths` are any elements with a class attribute; returns true if classes were added.
 */
export function ensureMapClasses(paths: Iterable<Element>, n: number): boolean {
  if (isMapRange(n)) return false
  const done = new RegExp(`q[0-9]+-${n}(\\s|$)`)
  let changed = false
  for (const path of paths) {
    const cls = path.getAttribute('class') || ''
    if (done.test(cls)) return changed
    const m = cls.match(/q(\d+)-12(\s|$)/)
    if (!m) continue
    path.setAttribute('class', `${cls} q${deriveMapClass(parseInt(m[1], 10), n)}-${n}`)
    changed = true
  }
  return changed
}

/** The class index for n classes read from a path's class attribute, or null. */
export function classIndex(classAttr: string, n: number): number | null {
  const m = classAttr.match(new RegExp(`q([0-9]+)-${n}(?![0-9])`))
  return m ? parseInt(m[1], 10) : null
}
