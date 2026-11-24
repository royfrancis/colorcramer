import { h } from 'vue'
import type { Theme } from 'vitepress'
import { Content } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ColorCramer from '@/components/ColorCramer.vue'

export default {
  extends: DefaultTheme,
  // bare layout: just the page content, no VitePress navbar
  Layout: () => h('main', { class: 'cc-page' }, h(Content)),
  enhanceApp({ app }) {
    app.component('ColorCramer', ColorCramer)
  }
} satisfies Theme
