import { describe, expect, it } from 'vitest'
import { SCHEME_TYPES, schemeNames } from '@/data/schemes'
import { MAX_CLASSES, buildUrl, clampClasses, parseParams } from '@/lib/params'

describe('clampClasses', () => {
  it('keeps whole numbers from 1 to the maximum', () => {
    expect(clampClasses('7')).toBe(7)
    expect(clampClasses(1)).toBe(1)
    expect(clampClasses(MAX_CLASSES)).toBe(MAX_CLASSES)
  })

  it('caps large values', () => {
    expect(clampClasses('1000000')).toBe(MAX_CLASSES)
    expect(clampClasses(51)).toBe(MAX_CLASSES)
  })

  it('falls back to the default for anything else', () => {
    for (const v of ['0', '-3', 'abc', '', null, undefined, NaN]) expect(clampClasses(v), String(v)).toBe(6)
  })
})

describe('parseParams', () => {
  const cases: [string, string, string, number, boolean][] = [
    ['', 'sequential', 'Batlow', 6, false],
    ['?type=diverging&scheme=Vik&n=7', 'diverging', 'Vik', 7, false],
    ['?scheme=BuGn', 'sequential', 'Batlow', 6, false],
    ['?type=diverging&scheme=Batlow', 'diverging', 'Broc', 6, false],
    ['?type=cyclical&scheme=RomaO&n=5', 'cyclic', 'RomaO', 5, false],
    ['?type=constructor&scheme=__proto__', 'sequential', 'Batlow', 6, false],
    ['?type=)&scheme=x&n=1000000', 'sequential', 'Batlow', 50, false],
    ['?n=0', 'sequential', 'Batlow', 6, false],
    ['?n=abc', 'sequential', 'Batlow', 6, false],
    ['?type=cyclic&scheme=Batlow%20selected', 'cyclic', 'RomaO', 6, false],
    ['?reverse=1', 'sequential', 'Batlow', 6, true],
    ['?reverse=0', 'sequential', 'Batlow', 6, false],
    ['?reverse=true', 'sequential', 'Batlow', 6, false],
    ['?type=multi-sequential&scheme=Fes&n=12&reverse=1', 'multi-sequential', 'Fes', 12, true]
  ]

  it.each(cases)('%s', (search, type, scheme, n, reversed) => {
    expect(parseParams(search)).toEqual({ type, scheme, n, reversed })
  })
})

describe('buildUrl', () => {
  it('replaces any query and hash on the base', () => {
    const url = buildUrl('https://example.org/colorcramer/?old=1#top', { type: 'sequential', scheme: 'Batlow', n: 6, reversed: false })
    expect(url).toBe('https://example.org/colorcramer/?type=sequential&scheme=Batlow&n=6')
  })

  it('adds reverse only when reversed', () => {
    const p = { type: 'diverging', scheme: 'Vik', n: 9, reversed: true } as const
    expect(buildUrl('https://x.org/', p)).toBe('https://x.org/?type=diverging&scheme=Vik&n=9&reverse=1')
  })

  it('round-trips through parseParams for every scheme', () => {
    for (const type of SCHEME_TYPES) {
      for (const scheme of schemeNames[type]) {
        for (const n of [1, 6, 50]) {
          for (const reversed of [false, true]) {
            const p = { type, scheme, n, reversed }
            expect(parseParams(new URL(buildUrl('https://x.org/', p)).search)).toEqual(p)
          }
        }
      }
    }
  })
})
