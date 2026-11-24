import { describe, expect, it } from 'vitest'
import { colorMatrixValues, filterId, visionMatrices, visionOptions, type VisionKind } from '@/lib/cvd'

const kinds = Object.keys(visionMatrices) as VisionKind[]

describe('vision deficiency matrices', () => {
  it('keeps neutral greys neutral (every row sums to 1)', () => {
    for (const kind of kinds) {
      for (const row of visionMatrices[kind]) {
        expect(row[0] + row[1] + row[2], kind).toBeCloseTo(1, 4)
      }
    }
  })

  it('uses the same luminance row three times for achromatopsia', () => {
    const [r, g, b] = visionMatrices.achromatopsia
    expect(g).toEqual(r)
    expect(b).toEqual(r)
    expect(r).toEqual([0.2126, 0.7152, 0.0722])
  })

  it('matches the published first rows of the Machado 2009 matrices', () => {
    expect(visionMatrices.protanopia[0]).toEqual([0.152286, 1.052583, -0.204868])
    expect(visionMatrices.deuteranopia[0]).toEqual([0.367322, 0.860646, -0.227968])
    expect(visionMatrices.tritanopia[0]).toEqual([1.255528, -0.076749, -0.178779])
  })

  it('writes a 5x4 feColorMatrix with alpha unchanged', () => {
    for (const kind of kinds) {
      const values = colorMatrixValues(visionMatrices[kind]).split(' ')
      expect(values).toHaveLength(20)
      expect(values.slice(15)).toEqual(['0', '0', '0', '1', '0'])
      expect(values.every((v) => Number.isFinite(Number(v)))).toBe(true)
    }
  })

  it('offers normal vision plus the four deficiencies, each with a filter id', () => {
    expect(visionOptions.map((o) => o.value)).toEqual(['', ...kinds])
    expect(new Set(kinds.map(filterId)).size).toBe(kinds.length)
  })
})
