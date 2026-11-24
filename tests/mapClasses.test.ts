import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { classIndex, deriveMapClass, ensureMapClasses, isMapRange } from '@/lib/mapClasses'

function fakePath(cls: string): Element {
  let value = cls
  return { getAttribute: () => value, setAttribute: (_: string, v: string) => (value = v) } as unknown as Element
}

describe('map classes', () => {
  it('knows the range the map was designed for', () => {
    expect(isMapRange(2)).toBe(false)
    expect(isMapRange(3)).toBe(true)
    expect(isMapRange(12)).toBe(true)
    expect(isMapRange(13)).toBe(false)
  })

  it('derives a class from the 12-class split', () => {
    expect(deriveMapClass(0, 20)).toBe(0)
    expect(deriveMapClass(11, 20)).toBe(19)
    expect(deriveMapClass(11, 2)).toBe(1)
    expect(deriveMapClass(5, 1)).toBe(0)
  })

  it('uses only 12 distinct classes above 12 (the limit the app documents)', () => {
    for (const n of [13, 20, 50]) {
      const used = new Set(Array.from({ length: 12 }, (_, q) => deriveMapClass(q, n)))
      expect(used.size, String(n)).toBe(12)
    }
    expect(new Set(Array.from({ length: 12 }, (_, q) => deriveMapClass(q, 2))).size).toBe(2)
  })

  it('adds derived classes once', () => {
    const a = fakePath('q6-12 q1-3')
    const b = fakePath('q0-12')
    expect(ensureMapClasses([a, b], 20)).toBe(true)
    expect(a.getAttribute('class')).toBe('q6-12 q1-3 q10-20')
    expect(b.getAttribute('class')).toBe('q0-12 q0-20')
    expect(ensureMapClasses([a, b], 20)).toBe(false)
  })

  it('leaves the shipped range alone', () => {
    const a = fakePath('q6-12')
    expect(ensureMapClasses([a], 8)).toBe(false)
    expect(a.getAttribute('class')).toBe('q6-12')
  })

  it('reads a class index for the current class count only', () => {
    expect(classIndex('q6-12 q5-11 q2-5', 12)).toBe(6)
    expect(classIndex('q6-12 q5-11 q2-5', 5)).toBe(2)
    expect(classIndex('q0-1 q10-12', 1)).toBe(0)
    expect(classIndex('q5-11', 1)).toBeNull()
    expect(classIndex('', 6)).toBeNull()
  })
})

describe('map.svg', () => {
  const svg = readFileSync('docs/public/map/map.svg', 'utf8')
  const classes = [...svg.matchAll(/<path class="([^"]*)"/g)].map((m) => m[1])

  it('has the 1735 county paths', () => {
    expect(classes).toHaveLength(1735)
  })

  it('gives every path a class for each count from 3 to 12', () => {
    for (const cls of classes) {
      const tokens = cls.split(/\s+/)
      for (let n = 3; n <= 12; n++) expect(tokens.some((t) => new RegExp(`^q\\d+-${n}$`).test(t))).toBe(true)
    }
  })

  it('uses exactly n distinct classes for each count from 3 to 12', () => {
    for (let n = 3; n <= 12; n++) {
      const ids = new Set<number>()
      for (const cls of classes) {
        const i = classIndex(cls, n)
        if (i !== null) ids.add(i)
      }
      expect(ids.size, String(n)).toBe(n)
    }
  })
})
