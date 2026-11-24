<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import loader from '@/assets/ajax-loader.gif'
import { formatColors } from '@/lib/color'
import { mapCss } from '@/lib/exports'
import { classIndex, ensureMapClasses } from '@/lib/mapClasses'
import { useState } from './useColorCramer'

const s = useState()
const base = import.meta.env.BASE_URL

const boxEl = ref<HTMLElement>()
const mapEl = ref<HTMLElement>()
const overlaysEl = ref<HTMLElement>()

const loaded = ref(false)
const error = ref('')
const overlays = ref<'none' | 'loading' | 'loaded'>('none')
const terrainUsed = ref(false)

const tip = reactive({ visible: false, x: 0, y: 0, cls: 0, rgb: '', cmyk: '', hex: '' })

let styleEl: HTMLStyleElement | null = null
let highlight: Element | null = null

/** Fetch an SVG from the site's public folder and insert it into a container; returns the <svg> element. */
async function loadSvg(path: string, container: HTMLElement): Promise<SVGSVGElement> {
  const res = await fetch(base + path)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  container.innerHTML = await res.text()
  const svg = container.querySelector('svg')
  if (!svg) throw new Error(`${path}: no <svg> element`)
  svg.setAttribute('width', '756')
  svg.setAttribute('height', '581')
  return svg
}

onMounted(async () => {
  // one <style> element holds the fill rules of the current palette
  styleEl = document.createElement('style')
  boxEl.value?.appendChild(styleEl)
  watchEffect(() => {
    if (styleEl) styleEl.textContent = mapCss('.cc-map', s.colors, s.borders)
  })

  try {
    await loadSvg('map/map.svg', mapEl.value as HTMLElement)
    ensureMapClasses(mapEl.value!.querySelectorAll('path'), s.n)
    loaded.value = true
  } catch (e) {
    error.value = 'The map could not be loaded.'
    console.error(e)
  }
})

onBeforeUnmount(() => {
  styleEl?.remove()
  hide()
})

// classes outside the shipped 3-12 are derived once per n
watch(
  () => s.n,
  (n) => {
    if (loaded.value) ensureMapClasses(mapEl.value!.querySelectorAll('path'), n)
  }
)

// the overlay file holds both roads and cities, so it is fetched once, the first time either is wanted
watch(
  () => s.roads || s.cities,
  async (wanted) => {
    if (!wanted || overlays.value !== 'none') return
    overlays.value = 'loading'
    try {
      await loadSvg('map/overlays.svg', overlaysEl.value as HTMLElement)
      overlays.value = 'loaded'
    } catch (e) {
      overlays.value = 'none'
      console.error(e)
    }
  }
)

watch(
  () => s.background,
  (b) => {
    if (b === 'terrain') terrainUsed.value = true
  }
)

const boxStyle = computed(() => ({
  '--cc-bg': s.bgColor,
  '--cc-border': s.borderColor,
  '--cc-road': s.roadColor,
  '--cc-city': s.cityColor,
  '--cc-opacity': String(1 - s.transparency / 100)
}))

function hide(): void {
  tip.visible = false
  highlight?.remove()
  highlight = null
}

function onOver(e: MouseEvent): void {
  const path = (e.target as Element).closest?.('path')
  if (!path || !mapEl.value?.contains(path)) {
    hide()
    return
  }
  const index = classIndex(path.getAttribute('class') || '', s.n)
  const color = index === null ? undefined : s.colors[index]
  if (index === null || !color) {
    hide()
    return
  }

  tip.cls = index + 1
  tip.rgb = formatColors([color], 'rgb').lines[0]
  tip.cmyk = formatColors([color], 'cmyk').lines[0]
  tip.hex = formatColors([color], 'hex').lines[0]
  tip.visible = true

  highlight?.remove()
  const outline = path.cloneNode(true) as SVGElement
  outline.style.pointerEvents = 'none'
  outline.style.stroke = '#000'
  outline.style.strokeWidth = '2'
  path.parentElement?.appendChild(outline)
  highlight = outline
}

function onMove(e: MouseEvent): void {
  tip.x = Math.max(0, e.clientX + 10)
  tip.y = Math.max(0, e.clientY - 75)
}
</script>

<template>
  <div
    ref="boxEl"
    class="cc-map-box"
    :class="{ 'cc-terrain-on': s.background === 'terrain', 'cc-roads-on': s.roads, 'cc-cities-on': s.cities }"
    :style="boxStyle"
  >
    <img v-if="terrainUsed" v-show="s.background === 'terrain'" class="cc-terrain" :src="`${base}map/terrain.jpg`" alt="" />
    <div ref="mapEl" class="cc-map" @mouseover="onOver" @mousemove="onMove" @mouseleave="hide" />
    <div ref="overlaysEl" class="cc-overlays" />
    <img v-if="!loaded && !error" class="cc-loading" :src="loader" alt="Loading map" />
    <p v-if="error" class="cc-map-error">{{ error }}</p>
  </div>
  <div v-show="tip.visible" class="cc-probe" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
    <div>{{ s.scheme }} class {{ tip.cls }}</div>
    <div>RGB: {{ tip.rgb }}</div>
    <div>CMYK: {{ tip.cmyk }}</div>
    <div>HEX: {{ tip.hex }}</div>
  </div>
</template>
