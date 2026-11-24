import { describe, expect, it } from 'vitest'
import {
  compareColormaps,
  findMapEntry,
  floatsToHex,
  isLicenceEntry,
  mapNamesInZip,
  parseColormapTxt,
  renderColormapsModule,
  type ReleaseInfo
} from '../scripts/colormaps-lib'

const rows = (n: number, row = '0.5 0.25 1'): string => Array.from({ length: n }, () => row).join('\n')

describe('floatsToHex', () => {
  it('rounds 0-1 floats to a hex color', () => {
    expect(floatsToHex(0.005193, 0.098238, 0.349842)).toBe('#011959')
    expect(floatsToHex(0, 0, 0)).toBe('#000000')
    expect(floatsToHex(1, 1, 1)).toBe('#ffffff')
  })
})

describe('parseColormapTxt', () => {
  it('reads 256 rows of three floats', () => {
    const stops = parseColormapTxt(rows(256) + '\n', 'test')
    expect(stops).toHaveLength(256)
    expect(stops[0]).toBe('#8040ff')
  })

  it('accepts CRLF line endings and extra spaces', () => {
    expect(parseColormapTxt(rows(256, ' 0.5   0.25  1 ').replace(/\n/g, '\r\n'), 'test')).toHaveLength(256)
  })

  it('rejects the wrong number of rows', () => {
    expect(() => parseColormapTxt(rows(255), 'test')).toThrow(/expected 256 rows, found 255/)
  })

  it('rejects malformed rows', () => {
    const bad = [rows(2), '0.1 0.2', rows(253)].join('\n')
    expect(() => parseColormapTxt(bad, 'test')).toThrow(/row 3/)
    expect(() => parseColormapTxt([rows(255), '0.1 0.2 1.5'].join('\n'), 'test')).toThrow(/row 256/)
    expect(() => parseColormapTxt([rows(255), '0.1 x 0.3'].join('\n'), 'test')).toThrow(/row 256/)
  })
})

describe('zip entry helpers', () => {
  const entries = [
    'ScientificColourMaps8/batlow/batlow.txt',
    'ScientificColourMaps8/batlow/batlow.cpt',
    'ScientificColourMaps8/batlowW/batlowW.txt',
    'ScientificColourMaps8/LICENSE.txt',
    'ScientificColourMaps8/batlow/readme.txt'
  ]

  it('finds a map file without confusing similar names', () => {
    expect(findMapEntry(entries, 'batlow')).toBe('ScientificColourMaps8/batlow/batlow.txt')
    expect(findMapEntry(entries, 'batlowW')).toBe('ScientificColourMaps8/batlowW/batlowW.txt')
    expect(findMapEntry(entries, 'oslo')).toBeNull()
  })

  it('refuses ambiguous matches', () => {
    expect(() => findMapEntry(['a/batlow/batlow.txt', 'b/batlow/batlow.txt'], 'batlow')).toThrow(/several/)
  })

  it('lists the maps in the zip', () => {
    expect(mapNamesInZip(entries)).toEqual(['batlow', 'batlowW'])
  })

  it('recognises top-level licence files only', () => {
    expect(isLicenceEntry('ScientificColourMaps8/LICENSE.txt')).toBe(true)
    expect(isLicenceEntry('LICENCE')).toBe(true)
    expect(isLicenceEntry('ScientificColourMaps8/batlow/readme.txt')).toBe(false)
  })
})

describe('renderColormapsModule', () => {
  const release: ReleaseInfo = { version: '1.2.3', doi: '10.1/x', url: 'https://example.org/r', file: 'f.zip', md5: 'abc', date: '2020-01-01' }

  it('writes sorted keys and the release', () => {
    const src = renderColormapsModule({ Zed: ['#000000'], Alpha: ['#ffffff'] }, release)
    expect(src.indexOf('"Alpha"')).toBeLessThan(src.indexOf('"Zed"'))
    expect(src).toContain('export const colormaps')
    expect(src).toContain('"version": "1.2.3"')
    expect(src.startsWith('// GENERATED')).toBe(true)
  })

  it('is deterministic', () => {
    const maps = { B: ['#000000'], A: ['#111111'] }
    expect(renderColormapsModule(maps, release)).toBe(renderColormapsModule({ A: ['#111111'], B: ['#000000'] }, release))
  })
})

describe('compareColormaps', () => {
  it('reports differing stops and the largest channel difference', () => {
    const c = compareColormaps({ A: ['#000000', '#010203', '#ffffff'], New: ['#000000'] }, { A: ['#000000', '#000000', '#fffffe'] })
    expect(c).toEqual({ maps: 1, missingInOld: ['New'], stopsCompared: 3, stopsDiffering: 2, maxChannelDiff: 3 })
  })
})
