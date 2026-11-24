import { describe, expect, it } from 'vitest'
import { CRAMERI_RELEASE, colormaps } from '@/data/colormaps'
import { SCHEME_TYPES, allSchemeNames, releaseName, schemeName, schemeNames } from '@/data/schemes'

describe('colormaps data', () => {
  it('has every scheme offered by the app and nothing else', () => {
    expect(Object.keys(colormaps).sort()).toEqual([...allSchemeNames].sort())
  })

  it('has 256 "#rrggbb" stops per map', () => {
    for (const [name, stops] of Object.entries(colormaps)) {
      expect(stops, name).toHaveLength(256)
      for (const stop of stops) expect(stop, name).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('has the expected number of palettes per gradient type', () => {
    expect(SCHEME_TYPES).toEqual(['sequential', 'diverging', 'cyclic', 'multi-sequential'])
    expect(schemeNames.sequential).toHaveLength(22)
    expect(schemeNames.diverging).toHaveLength(10)
    expect(schemeNames.cyclic).toHaveLength(5)
    expect(schemeNames['multi-sequential']).toHaveLength(3)
  })

  it('has no scheme listed twice', () => {
    expect(new Set(allSchemeNames).size).toBe(allSchemeNames.length)
  })

  it('records the Crameri release it came from', () => {
    expect(CRAMERI_RELEASE.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(CRAMERI_RELEASE.md5).toMatch(/^[0-9a-f]{32}$/)
    expect(CRAMERI_RELEASE.url).toContain('zenodo.org')
  })

  it('maps app names to release names and back', () => {
    expect(releaseName('GrayC')).toBe('grayC')
    expect(releaseName('Batlow')).toBe('batlow')
    expect(schemeName('romaO')).toBe('RomaO')
    for (const name of allSchemeNames) expect(schemeName(releaseName(name))).toBe(name)
  })
})
