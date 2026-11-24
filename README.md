ColorCramer
==============

Fabio Crameri palettes integrated into the original ColorBrewer-style interface.

Web tool for guidance in choosing choropleth map color schemes, now using Fabio Crameri Scientific Colour Maps while preserving the familiar interface.

[https://royfrancis.github.io/colorcramer/](https://royfrancis.github.io/colorcramer/)

## Running locally

The map is loaded over HTTP, so `index.html` does not work when opened directly from disk (`file://`). Serve the folder instead:

```
python3 -m http.server 8000
```

and open <http://localhost:8000/>. Palette data and jQuery are loaded from a CDN, so an internet connection is needed.

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

Colour maps by [Fabio Crameri](https://www.fabiocrameri.ch/colourmaps/) (MIT licence). If you use them, please cite Crameri, F. (2018), Scientific colour maps, Zenodo, [doi:10.5281/zenodo.1243862](https://doi.org/10.5281/zenodo.1243862), and Crameri, F., Shephard, G.E. and Heron, P.J. (2020), The misuse of colour in science communication, Nature Communications 11, 5444. Palette data is generated with [fabio-crameri-palette-generator](https://github.com/justdan96/fabio-crameri-palette-generator).
