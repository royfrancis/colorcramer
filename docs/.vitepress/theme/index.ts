import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ColorCramer from '@/components/ColorCramer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ColorCramer', ColorCramer)
  }
} satisfies Theme
