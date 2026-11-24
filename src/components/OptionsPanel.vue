<script setup lang="ts">
import { visionOptions } from '@/lib/cvd'
import { useState } from './useColorCramer'

const s = useState()
</script>

<template>
  <div class="cc-options">
    <button type="button" class="cc-learn-more" title="Learn more" aria-label="About map context and background" @click.stop="s.infoPage = 'context'" />
    <p>Context:</p>
    <div class="cc-layers">
      <div class="cc-row">
        <input id="cc-roads" v-model="s.roads" type="checkbox" /><label for="cc-roads">roads</label>
        <input v-model="s.roadColor" type="color" aria-label="Road color" />
      </div>
      <div class="cc-row">
        <input id="cc-cities" v-model="s.cities" type="checkbox" /><label for="cc-cities">cities</label>
        <input v-model="s.cityColor" type="color" aria-label="City color" />
      </div>
      <div class="cc-row">
        <input id="cc-borders" v-model="s.borders" type="checkbox" /><label for="cc-borders">borders</label>
        <input v-model="s.borderColor" type="color" aria-label="Border color" />
      </div>
    </div>

    <p>Background:</p>
    <div class="cc-background">
      <div class="cc-row">
        <input id="cc-solid" type="radio" name="cc-background" :checked="s.background === 'solid'" @change="s.setBackground('solid')" />
        <label for="cc-solid">solid color</label>
        <input v-model="s.bgColor" type="color" aria-label="Background color" />
      </div>
      <div class="cc-row">
        <input id="cc-terrain" type="radio" name="cc-background" :checked="s.background === 'terrain'" @change="s.setBackground('terrain')" />
        <label for="cc-terrain">terrain</label>
      </div>
      <div class="cc-transparency">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="s.transparency"
          aria-label="Color transparency"
          @input="s.setTransparency(Number(($event.target as HTMLInputElement).value))"
        />
        <p>color transparency</p>
      </div>
    </div>

    <p>Emulate vision deficiencies:</p>
    <div class="cc-vision">
      <select v-model="s.vision" title="Approximate simulation of how the map looks with this condition" aria-label="Emulate vision deficiency">
        <option v-for="o in visionOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </div>

    <div class="cc-reverse">
      <input id="cc-reverse" v-model="s.reversed" type="checkbox" /><label for="cc-reverse">Reverse palette</label>
    </div>
  </div>
</template>
