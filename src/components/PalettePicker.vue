<script setup lang="ts">
import { SCHEME_TYPES } from '@/data/schemes'
import { getPalette } from '@/lib/palettes'
import { MAP_MAX_CLASSES, MAP_MIN_CLASSES } from '@/lib/mapClasses'
import { MAX_CLASSES } from '@/lib/params'
import { useState } from './useColorCramer'

const s = useState()

const rangeHint = `The diagnostic map is designed for ${MAP_MIN_CLASSES}-${MAP_MAX_CLASSES} classes. Outside that range it shows at most ${MAP_MAX_CLASSES} distinct colors and has no outlier test.`

/** Five colors of a scheme for its thumbnail in the picker. */
function thumb(name: string): string[] {
  return getPalette(name, 5, s.reversed)
}
</script>

<template>
  <div class="cc-section cc-number" :class="{ 'cc-out-of-range': s.outOfMapRange }">
    <button type="button" class="cc-learn-more" title="Learn more" aria-label="About the number of data classes" @click.stop="s.infoPage = 'number'" />
    <p>Number of data classes:</p>
    <div class="cc-number-slider">
      <input
        type="range"
        min="1"
        :max="MAX_CLASSES"
        step="1"
        :value="s.n"
        :title="s.outOfMapRange ? rangeHint : ''"
        aria-label="Number of data classes"
        @input="s.setClasses(($event.target as HTMLInputElement).value)"
      />
      <span class="cc-num-value" :title="s.outOfMapRange ? rangeHint : ''">{{ s.n }}</span>
    </div>
  </div>

  <div class="cc-section cc-type">
    <button type="button" class="cc-learn-more" title="Learn more" aria-label="About gradient types" @click.stop="s.infoPage = 'schemes'" />
    <p>Gradient types:</p>
    <div class="cc-type-list">
      <span v-for="t in SCHEME_TYPES" :key="t" class="cc-type-item" :class="{ 'cc-type-wide': t === 'multi-sequential' }">
        <input :id="`cc-type-${t}`" type="radio" name="cc-scheme-type" :checked="s.type === t" @change="s.setType(t)" />
        <label class="cc-check-label" :for="`cc-type-${t}`">{{ t }}</label>
      </span>
    </div>
  </div>

  <div class="cc-section cc-scheme">
    <p>Pick a palette:</p>
    <div class="cc-ramps">
      <div
        v-for="name in s.ramps"
        :key="name"
        class="cc-ramp"
        :class="{ selected: name === s.scheme }"
        :title="name"
        :data-scheme="name"
        @click="s.scheme = name"
      >
        <svg width="15" height="75">
          <rect v-for="(c, i) in thumb(name)" :key="i" :fill="c" width="15" height="15" :y="i * 15" />
        </svg>
      </div>
    </div>
  </div>
</template>
