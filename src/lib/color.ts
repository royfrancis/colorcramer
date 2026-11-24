export interface Rgb {
  r: number
  g: number
  b: number
}

export type ColorSystem = 'hex' | 'rgb' | 'cmyk'

export function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

/** "rgb(12, 34, 56)" -> {12, 34, 56}; returns null for anything else. */
export function parseRgbString(c: string): Rgb | null {
  const m = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(c)
  return m ? { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) } : null
}

export function toRgbString(c: Rgb): string {
  return `rgb(${c.r},${c.g},${c.b})`
}

/** Simple RGB -> CMYK conversion (not colour-managed). Returns percentages. */
export function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100]

  let c = 1 - r / 255
  let m = 1 - g / 255
  let y = 1 - b / 255
  const k = Math.min(c, m, y)
  c = (c - k) / (1 - k)
  m = (m - k) / (1 - k)
  y = (y - k) / (1 - k)

  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)]
}

/** Any "#rrggbb" or "rgb(r,g,b)" string as an Rgb, or null. */
export function toRgb(c: string): Rgb | null {
  return c.startsWith('#') ? hexToRgb(c) : parseRgbString(c)
}

export interface FormattedColors {
  /** one line per color in the chosen system (no function wrapper), for the values column */
  lines: string[]
  /** the list used for the JSON export: "#rrggbb", "rgb(r,g,b)" or "cmyk(c,m,y,k)" */
  list: string[]
}

/** Colors (as "#rrggbb" or "rgb(r,g,b)" strings) in the chosen color system. */
export function formatColors(colors: string[], system: ColorSystem): FormattedColors {
  const lines: string[] = []
  const list: string[] = []
  for (const color of colors) {
    const rgb = toRgb(color)
    if (!rgb) throw new Error(`Unsupported color: ${color}`)
    let line: string
    if (system === 'hex') line = rgbToHex(rgb.r, rgb.g, rgb.b)
    else if (system === 'rgb') line = `${rgb.r},${rgb.g},${rgb.b}`
    else line = rgbToCmyk(rgb.r, rgb.g, rgb.b).join(',')
    lines.push(line)
    list.push(system === 'hex' ? line : `${system}(${line})`)
  }
  return { lines, list }
}
