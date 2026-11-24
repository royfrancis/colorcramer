// Generate src/data/colormaps.ts from the pinned Fabio Crameri "Scientific colour maps" release.
//
//   npm run build:colormaps
//
// Downloads the release zip (about 67 MB) into .cache/ the first time, verifies its md5,
// reads the 256-stop text file of every map listed in src/data/schemes.ts and writes
// src/data/colormaps.ts. Commit the result; CI and `npm run docs:build` use the committed file.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { strFromU8, unzipSync } from 'fflate'
import { allSchemeNames, releaseName, schemeName } from '../src/data/schemes'
import {
  compareColormaps,
  findMapEntry,
  isLicenceEntry,
  mapNamesInZip,
  parseColormapTxt,
  renderColormapsModule,
  type ReleaseInfo
} from './colormaps-lib'

// Zenodo record 8409685: Scientific colour maps 8.0.1 (checksum and size from the record's API metadata).
const RELEASE: ReleaseInfo = {
  version: '8.0.1',
  doi: '10.5281/zenodo.8409685',
  url: 'https://zenodo.org/records/8409685',
  file: 'ScientificColourMaps8.zip',
  md5: 'e63c1d2dbed7eb9c8a177ab8da37365b',
  date: '2023-10-05'
}
const DOWNLOAD_URL = `https://zenodo.org/api/records/8409685/files/${RELEASE.file}/content`

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const zipPath = resolve(root, '.cache', RELEASE.file)
const outPath = resolve(root, 'src/data/colormaps.ts')
const licencePath = resolve(root, 'third_party/CRAMERI-LICENSE.txt')

function md5(bytes: Uint8Array): string {
  return createHash('md5').update(bytes).digest('hex')
}

async function getZip(): Promise<Uint8Array> {
  if (!existsSync(zipPath)) {
    console.log(`Downloading ${DOWNLOAD_URL} ...`)
    const res = await fetch(DOWNLOAD_URL)
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`)
    mkdirSync(dirname(zipPath), { recursive: true })
    writeFileSync(zipPath, new Uint8Array(await res.arrayBuffer()))
  }
  const bytes = new Uint8Array(readFileSync(zipPath))
  const actual = md5(bytes)
  if (actual !== RELEASE.md5) {
    rmSync(zipPath)
    throw new Error(`md5 mismatch for ${RELEASE.file}: expected ${RELEASE.md5}, got ${actual}. The cached file was removed.`)
  }
  console.log(`${RELEASE.file}: md5 ok (${bytes.length} bytes)`)
  return bytes
}

async function main(): Promise<void> {
  const zip = await getZip()

  const wanted = new Set(allSchemeNames.map(releaseName))
  const seen: string[] = []
  const files = unzipSync(zip, {
    filter: (file) => {
      seen.push(file.name)
      const m = file.name.match(/(?:^|\/)([^/]+)\/\1\.txt$/)
      return (m !== null && wanted.has(m[1])) || isLicenceEntry(file.name)
    }
  })

  const entryNames = Object.keys(files)
  const maps: Record<string, string[]> = {}
  const missing: string[] = []
  for (const name of allSchemeNames) {
    const entry = findMapEntry(entryNames, releaseName(name))
    if (!entry) {
      missing.push(name)
      continue
    }
    maps[schemeName(releaseName(name))] = parseColormapTxt(strFromU8(files[entry]), name)
  }
  if (missing.length) {
    throw new Error(`Not found in the release: ${missing.join(', ')}. Entries look like: ${seen.slice(0, 5).join(' | ')}`)
  }

  const unused = mapNamesInZip(seen).filter((n) => !wanted.has(n))
  console.log(`Maps written: ${Object.keys(maps).length}. In the release but not offered: ${unused.join(', ') || 'none'}`)

  // report how the new data differs from the file it replaces (e.g. the old third-party colormaps.js)
  try {
    const previous = (await import('../src/data/colormaps')).colormaps
    const c = compareColormaps(maps, previous)
    console.log(
      `Compared with the previous src/data/colormaps.ts: ${c.maps} maps, ${c.stopsDiffering} of ${c.stopsCompared} stops differ` +
        ` (largest channel difference ${c.maxChannelDiff}/255)` +
        (c.missingInOld.length ? `; new maps: ${c.missingInOld.join(', ')}` : '')
    )
  } catch {
    console.log('No previous src/data/colormaps.ts to compare with.')
  }

  writeFileSync(outPath, renderColormapsModule(maps, RELEASE))
  console.log(`Wrote ${outPath}`)

  const licence = entryNames.find(isLicenceEntry)
  if (licence) {
    mkdirSync(dirname(licencePath), { recursive: true })
    writeFileSync(licencePath, strFromU8(files[licence]))
    console.log(`Licence file "${licence}" copied to third_party/CRAMERI-LICENSE.txt: check it and update NOTICE.txt`)
  } else {
    console.warn('No licence/readme file found at the top of the zip. Zenodo lists the record as "mit-license".')
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
