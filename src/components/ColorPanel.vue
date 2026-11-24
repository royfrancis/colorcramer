<script setup lang="ts">
import { useState } from './useColorCramer'

const CHIP_HEIGHT = 24
const s = useState()
</script>

<template>
  <div class="cc-system">
    <p class="cc-scheme-name">{{ s.n }}-class {{ s.scheme }}</p>
    <select v-model="s.system" title="CMYK is a simple RGB conversion, not colour-managed" aria-label="Color system">
      <option value="hex">HEX</option>
      <option value="rgb">RGB</option>
      <option value="cmyk">CMYK</option>
    </select>
    <div class="cc-system-body">
      <svg class="cc-chips" width="24" :height="CHIP_HEIGHT * s.n">
        <rect v-for="(c, i) in s.colors" :key="i" :fill="c" width="24" :height="CHIP_HEIGHT" :y="i * CHIP_HEIGHT" />
      </svg>
      <div class="cc-values">
        <textarea
          readonly
          wrap="off"
          aria-label="Color values"
          :style="{ lineHeight: CHIP_HEIGHT + 'px', height: CHIP_HEIGHT * s.n + 'px' }"
          :value="s.formatted.lines.join('\n')"
        />
      </div>
    </div>
  </div>
</template>
