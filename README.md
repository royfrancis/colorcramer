ColorCramer
==============

[![Deploy](https://github.com/royfrancis/colorcramer/actions/workflows/deploy.yml/badge.svg)](https://github.com/royfrancis/colorcramer/actions/workflows/deploy.yml)

Fabio Crameri palettes integrated into the original ColorBrewer-style interface.

Web tool for guidance in choosing choropleth map color schemes, now using Fabio Crameri Scientific Colour Maps while preserving the familiar interface.

[https://royfrancis.github.io/colorcramer/](https://royfrancis.github.io/colorcramer/)

## Development

The site is built with [VitePress](https://vitepress.dev/) and Vue 3 (TypeScript). It needs Node 20 or newer.

```
npm install          # install (CI uses `npm ci`, which needs the committed package-lock.json)
npm run docs:dev     # dev server with hot reload
npm test             # unit and component tests (Vitest)
npm run typecheck    # vue-tsc
npm run docs:build   # production build in docs/.vitepress/dist
npm run docs:preview # serve the production build
```

The site is published to GitHub Pages by `.github/workflows/deploy.yml` on every push to `master` (pull requests are built and tested but not deployed). In the repository settings, Pages must use **Build and deployment > Source: GitHub Actions**.

Layout: `src/components` (the app), `src/lib` (pure functions with tests), `src/data` (palette names and the generated palette data), `src/content` (the Learn more texts), `docs` (the VitePress site and the map files in `docs/public/map`), `scripts` (palette generator), `tests`.

## URL parameters

The current selection is kept in the address bar and can be shared:

| parameter | values | default |
|-----------|--------|---------|
| `type`    | `sequential`, `diverging`, `cyclic`, `multi-sequential` | `sequential` |
| `scheme`  | a palette name of the chosen type, e.g. `Batlow` | first palette of the type |
| `n`       | number of classes, 1 to 50 | `6` |
| `reverse` | `1` to reverse the palette order | not reversed |

Invalid values fall back to the defaults. Example: `?type=diverging&scheme=Vik&n=7&reverse=1`.

## Vision deficiency emulation

The "Emulate vision deficiencies" dropdown shows how the map, the color chips and the palette thumbnails look with protanopia, deuteranopia, tritanopia or achromatopsia. It applies SVG color-matrix filters (Machado, Oliveira and Fernandes 2009, full severity, applied in linear RGB; achromatopsia is shown as luminance grey), so the whole map is affected, including the terrain, roads and background. The listed color values and exports are not changed. This is an approximation for design guidance, not a medical tool.

## Limitations

- The diagnostic map is designed for **3 to 12 classes**. It only contains outlier test polygons for that range. With more than 12 classes the map shows at most 12 distinct colors (the palette and exports still contain all n colors), and with 1 or 2 classes there is no outlier test. The class slider goes from 1 to 50 for previewing and exporting palettes.
- CMYK values are a simple RGB to CMYK conversion and are not colour-managed.

## Credits and licence

Adapted from [ColorBrewer](https://colorbrewer2.org/) by Cynthia Brewer, Mark Harrower and The Pennsylvania State University (Apache-style licence, see `NOTICE.txt` and `LICENCE.txt`). This product includes color specifications and designs developed by Cynthia Brewer.

Colour maps by [Fabio Crameri](https://www.fabiocrameri.ch/colourmaps/) (MIT licence). If you use them, please cite Crameri, F. (2018), Scientific colour maps, Zenodo, [doi:10.5281/zenodo.1243862](https://doi.org/10.5281/zenodo.1243862), and Crameri, F., Shephard, G.E. and Heron, P.J. (2020), The misuse of colour in science communication, Nature Communications 11, 5444.

### Palette data

`src/data/colormaps.ts` is generated from [Scientific colour maps v8.0.1](https://zenodo.org/records/8409685) (Zenodo, 2023-10-05) with `npm run build:colormaps`. The script downloads the release zip (about 67 MB) into `.cache/`, checks its md5, reads the 256-stop text file of every palette listed in `src/data/schemes.ts`, and writes the TypeScript module. The generated file is committed, so building or deploying the site does not download anything. To move to another release, change the constants at the top of `scripts/build-colormaps.ts` and run the script; it prints how the new data differs from the old.

---

2026 • Roy Francis
