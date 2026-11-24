import { colormaps } from '@/data/colormaps'
import { hexToRgb, toRgbString } from './color'

/** Pick n evenly spaced colors (first and last stop included) from a colormap's hex stops, as "rgb(r,g,b)". */
export function samplePalette(stops: string[], n: number): string[] {
  const asRgb = (hex: string): string => {
    const rgb = hexToRgb(hex)
    if (!rgb) throw new Error(`Invalid hex color: ${hex}`)
    return toRgbString(rgb)
  }
  if (n === 1) return [asRgb(stops[Math.floor(stops.length / 2)])]
  const last = stops.length - 1
  const out: string[] = []
  for (let i = 0; i < n; i++) out.push(asRgb(stops[Math.round((i * last) / (n - 1))]))
  return out
}

const cache = new Map<string, string[]>()

/** The n colors of a scheme as "rgb(r,g,b)" strings, optionally in reverse order. */
export function getPalette(scheme: string, n: number, reversed = false): string[] {
  if (!Object.prototype.hasOwnProperty.call(colormaps, scheme)) return []
  const stops = colormaps[scheme]
  const key = `${scheme}:${n}`
  let colors = cache.get(key)
  if (!colors) {
    colors = samplePalette(stops, n)
    cache.set(key, colors)
  }
  return reversed ? colors.slice().reverse() : colors
}

