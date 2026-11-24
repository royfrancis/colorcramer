/** CSS classes for a palette, as shown in the Share panel: ".Scheme .q0-6{fill:rgb(..)} ..." */
export function cssExport(scheme: string, colors: string[]): string {
  const n = colors.length
  return colors.map((c, i) => `.${scheme} .q${i}-${n}{fill:${c}}`).join(' ')
}

/** The same rules without the scheme prefix, scoped to the map for rendering. */
export function mapCss(scope: string, colors: string[], borders: boolean): string {
  const n = colors.length
  return colors
    .map((c, i) => `${scope} .q${i}-${n}{fill:${c};${borders ? '' : `stroke:${c};stroke-width:1px;`}}`)
    .join('\n')
}

export function jsonExport(list: string[]): string {
  return JSON.stringify(list)
}
