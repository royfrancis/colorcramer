import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const root = fileURLToPath(new URL('../../', import.meta.url))

export default defineConfig({
  title: 'ColorCramer',
  description: 'Color advice for maps, using Fabio Crameri scientific colour maps',
  base: '/colorcramer/',
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
