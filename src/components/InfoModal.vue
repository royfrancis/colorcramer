<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import context from '@/content/context.html?raw'
import credits from '@/content/credits.html?raw'
import howtouse from '@/content/howtouse.html?raw'
import number from '@/content/number.html?raw'
import schemes from '@/content/schemes.html?raw'
import { useState, type InfoPage } from './useColorCramer'

const s = useState()
const base = import.meta.env.BASE_URL

const pages: Record<InfoPage, { title: string; html: string }> = {
  number: { title: 'NUMBER OF DATA CLASSES', html: number },
  schemes: { title: 'GRADIENT TYPES', html: schemes },
  context: { title: 'MAP CONTEXT and BACKGROUND', html: context },
  how: { title: 'HOW TO USE: MAP DIAGNOSTICS', html: howtouse },
  credits: { title: 'CREDITS', html: credits }
}

const page = computed(() => (s.infoPage ? pages[s.infoPage] : null))
// images in the fragments are relative to the site root
const html = computed(() => (page.value ? page.value.html.replaceAll('src="learnmore/', `src="${base}learnmore/`) : ''))

function close(): void {
  s.infoPage = null
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && s.infoPage) close()
}

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <template v-if="page">
    <div class="cc-mask" @click="close" />
    <div class="cc-modal" role="dialog" aria-modal="true" :aria-label="page.title">
      <div class="cc-modal-title">
        {{ page.title }}
        <button type="button" class="cc-modal-close" aria-label="Close" @click="close">X</button>
      </div>
      <!-- static, trusted content shipped with the site -->
      <div class="cc-modal-content" v-html="html" />
    </div>
  </template>
</template>
