import { describe, expect, it } from 'vitest'
import { cssExport, jsonExport, mapCss } from '@/lib/exports'

describe('exports', () => {
  const colors = ['rgb(1,2,3)', 'rgb(4,5,6)']

  it('builds the CSS shown in the share panel', () => {
    expect(cssExport('Batlow', colors)).toBe('.Batlow .q0-2{fill:rgb(1,2,3)} .Batlow .q1-2{fill:rgb(4,5,6)}')
  })

  it('builds the map rules, adding strokes only when borders are off', () => {
    expect(mapCss('.cc-map', colors, true)).toBe('.cc-map .q0-2{fill:rgb(1,2,3);}\n.cc-map .q1-2{fill:rgb(4,5,6);}')
    expect(mapCss('.cc-map', colors, false)).toContain('.cc-map .q0-2{fill:rgb(1,2,3);stroke:rgb(1,2,3);stroke-width:1px;}')
  })

  it('exports the JSON list', () => {
    expect(jsonExport(['#010203', '#040506'])).toBe('["#010203","#040506"]')
  })
})
