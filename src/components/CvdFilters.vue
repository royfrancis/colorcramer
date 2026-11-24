<script setup lang="ts">
import { colorMatrixValues, filterId, visionMatrices, type VisionKind } from '@/lib/cvd'

const kinds = Object.keys(visionMatrices) as VisionKind[]
</script>

<template>
  <!-- color-matrix filters for the "Emulate vision" option; applied by CSS (see colorcramer.css) -->
  <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
    <defs>
      <filter v-for="k in kinds" :id="filterId(k)" :key="k" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" :values="colorMatrixValues(visionMatrices[k])" />
      </filter>
    </defs>
  </svg>
</template>
