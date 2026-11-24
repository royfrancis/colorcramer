// The palettes offered by the app, grouped by gradient type (in display order).
// Names are the keys of src/data/colormaps.ts; the Crameri release uses the same
// names with a lower-case first letter (see releaseName).

export const SCHEME_TYPES = ['sequential', 'diverging', 'cyclic', 'multi-sequential'] as const

export type SchemeType = (typeof SCHEME_TYPES)[number]

export const schemeNames: Record<SchemeType, string[]> = {
  sequential: [
    'Batlow', 'BatlowW', 'BatlowK', 'Glasgow', 'Lipari', 'Navia', 'NaviaW', 'Hawaii', 'Buda', 'Imola', 'Oslo',
    'GrayC', 'Nuuk', 'Devon', 'Lajolla', 'Bamako', 'Davos', 'Bilbao', 'Lapaz', 'Acton', 'Turku', 'Tokyo'
  ],
  diverging: ['Broc', 'Cork', 'Vik', 'Lisbon', 'Tofino', 'Berlin', 'Bam', 'Roma', 'Vanimo', 'Managua'],
  cyclic: ['RomaO', 'BamO', 'BrocO', 'CorkO', 'VikO'],
  'multi-sequential': ['Oleron', 'Bukavu', 'Fes']
}

export const allSchemeNames: string[] = SCHEME_TYPES.flatMap((t) => schemeNames[t])

/** Folder/file name of a map in the Crameri release, e.g. "GrayC" -> "grayC". */
export function releaseName(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1)
}

/** App name for a map in the Crameri release, e.g. "grayC" -> "GrayC". */
export function schemeName(release: string): string {
  return release.charAt(0).toUpperCase() + release.slice(1)
}
