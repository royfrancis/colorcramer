import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const root = fileURLToPath(new URL('../../', import.meta.url))

// absolute URLs are needed for link previews (docs/public/og-image.jpg is served from the site root)
const site = 'https://royfrancis.github.io/colorcramer/'
const title = 'ColorCramer: color advice for maps'
const description = 'Color advice for maps, using Fabio Crameri scientific colour maps'
const image = `${site}og-image.jpg`

export default defineConfig({
  title: 'ColorCramer',
  description,
  base: '/colorcramer/',
  sitemap: { hostname: site },
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'ColorCramer' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: site }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'ColorCramer, scientific color maps: preview Fabio Crameri colour maps on a real map. A row of palette swatches sits next to a map filled with one of the palettes' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }]
  ],
  cleanUrls: true,
  lastUpdated: false,
  appearance: false, // light only
  vite: {
    resolve: {
      alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) }
    },
    server: {
      // the app code lives in ../src, outside the docs root
      fs: { allow: [root] }
    }
  }
})
