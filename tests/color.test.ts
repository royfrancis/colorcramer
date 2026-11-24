import { describe, expect, it } from 'vitest'
import { formatColors, hexToRgb, parseRgbString, rgbToCmyk, rgbToHex, toRgb } from '@/lib/color'

describe('color conversion', () => {
  it('converts between hex and rgb', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    expect(rgbToHex(1, 2, 3)).toBe('#010203')
    expect(hexToRgb('#00ff80')).toEqual({ r: 0, g: 255, b: 128 })
    expect(hexToRgb('00ff80')).toEqual({ r: 0, g: 255, b: 128 })
    expect(hexToRgb('#xyz')).toBeNull()
  })

  it('parses rgb() strings', () => {
    expect(parseRgbString('rgb(12, 34,56)')).toEqual({ r: 12, g: 34, b: 56 })
    expect(parseRgbString('rgba(1,2,3,1)')).toBeNull()
    expect(toRgb('#0a0b0c')).toEqual({ r: 10, g: 11, b: 12 })
    expect(toRgb('rgb(10,11,12)')).toEqual({ r: 10, g: 11, b: 12 })
  })

  it('converts rgb to cmyk percentages', () => {
    expect(rgbToCmyk(0, 0, 0)).toEqual([0, 0, 0, 100])
    expect(rgbToCmyk(255, 255, 255)).toEqual([0, 0, 0, 0])
    expect(rgbToCmyk(255, 0, 0)).toEqual([0, 100, 100, 0])
    expect(rgbToCmyk(0, 255, 0)).toEqual([100, 0, 100, 0])
  })
})

describe('formatColors', () => {
  const colors = ['rgb(255,0,0)', '#00ff00']

  it('formats as hex', () => {
    const f = formatColors(colors, 'hex')
    expect(f.lines).toEqual(['#ff0000', '#00ff00'])
    expect(f.list).toEqual(['#ff0000', '#00ff00'])
  })

  it('formats as rgb', () => {
    const f = formatColors(colors, 'rgb')
    expect(f.lines).toEqual(['255,0,0', '0,255,0'])
    expect(f.list).toEqual(['rgb(255,0,0)', 'rgb(0,255,0)'])
  })

  it('formats as cmyk', () => {
    const f = formatColors(colors, 'cmyk')
    expect(f.lines).toEqual(['0,100,100,0', '100,0,100,0'])
    expect(f.list).toEqual(['cmyk(0,100,100,0)', 'cmyk(100,0,100,0)'])
  })

  it('gives a list that is valid JSON in every system', () => {
    for (const system of ['hex', 'rgb', 'cmyk'] as const) {
      const f = formatColors(colors, system)
      expect(JSON.parse(JSON.stringify(f.list))).toEqual(f.list)
    }
  })

  it('rejects colors it cannot read', () => {
    expect(() => formatColors(['red'], 'hex')).toThrow(/Unsupported color/)
  })
})
