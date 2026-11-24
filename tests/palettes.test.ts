import { describe, expect, it } from 'vitest'
import { colormaps } from '@/data/colormaps'
import { allSchemeNames } from '@/data/schemes'
import { getPalette, samplePalette } from '@/lib/palettes'

const gradient = Array.from({ length: 256 }, (_, i) => '#' + [i, 255 - i, 0].map((v) => v.toString(16).padStart(2, '0')).join(''))

describe('samplePalette', () => {
  it('returns n rgb() colors including both ends', () => {
    const p = samplePalette(gradient, 5)
    expect(p).toHaveLength(5)
    expect(p[0]).toBe('rgb(0,255,0)')
    expect(p[4]).toBe('rgb(255,0,0)')
    for (const c of p) expect(c).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
  })

  it('takes the middle stop for a single class', () => {
    expect(samplePalette(gradient, 1)).toEqual(['rgb(128,127,0)'])
  })

  it('works for every class count the app allows', () => {
    for (let n = 1; n <= 50; n++) expect(samplePalette(gradient, n)).toHaveLength(n)
  })

  it('rejects stops that are not hex colors', () => {
    expect(() => samplePalette(['nope', 'nope'], 2)).toThrow(/Invalid hex/)
  })
})

describe('getPalette', () => {
  it('returns n colors for every scheme and class count', () => {
    for (const name of allSchemeNames) {
      for (const n of [1, 2, 3, 6, 12, 13, 50]) expect(getPalette(name, n), `${name} ${n}`).toHaveLength(n)
    }
  })

  it('starts and ends with the first and last stop of the map', () => {
    const stops = colormaps.Batlow
    const p = getPalette('Batlow', 7)
    const rgb = (hex: string): string => `rgb(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)})`
    expect(p[0]).toBe(rgb(stops[0]))
    expect(p[6]).toBe(rgb(stops[255]))
  })

  it('reverses without changing the cached palette', () => {
    const forward = getPalette('Oslo', 6).slice()
    const reversed = getPalette('Oslo', 6, true)
    expect(reversed).toEqual(forward.slice().reverse())
    expect(getPalette('Oslo', 6)).toEqual(forward)
  })

  it('returns nothing for an unknown scheme', () => {
    expect(getPalette('NoSuchScheme', 5)).toEqual([])
    expect(getPalette('constructor', 5)).toEqual([])
  })
})
