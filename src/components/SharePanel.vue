<script setup lang="ts">
import { ref } from 'vue'
import { copyText } from '@/lib/clipboard'
import { useState } from './useColorCramer'

const s = useState()

type Field = 'permalink' | 'json' | 'css'
const label = ref<Record<Field, string>>({ permalink: 'copy', json: 'copy', css: 'copy' })
// plain object (not reactive): the template refs only need to be remembered
const inputs: Partial<Record<Field, HTMLInputElement>> = {}

async function copy(field: Field, text: string): Promise<void> {
  const ok = await copyText(text, inputs[field])
  label.value[field] = ok ? 'copied' : 'failed'
  setTimeout(() => {
    label.value[field] = 'copy'
  }, 1200)
}
</script>

<template>
  <div class="cc-share" :class="{ open: s.shareOpen }">
    <button type="button" class="cc-share-tab" :aria-expanded="s.shareOpen" @click="s.shareOpen = !s.shareOpen">
      <span>SHARE</span>
    </button>
    <h2>Share your selected color scheme:</h2>

    <section class="cc-perma">
      <h3>Permalink</h3>
      <p>Share a direct link to this color scheme.</p>
      <div class="cc-copy-row">
        <input :ref="(el) => (inputs.permalink = el as HTMLInputElement)" type="text" readonly :value="s.permalink" aria-label="Permalink" />
        <button type="button" class="cc-copy-btn" title="Copy permalink" @click="copy('permalink', s.permalink)">{{ label.permalink }}</button>
      </div>
    </section>

    <section>
      <h3>JSON</h3>
      <p>Copy this scheme as a JSON array.</p>
      <div class="cc-copy-row">
        <input :ref="(el) => (inputs.json = el as HTMLInputElement)" type="text" readonly :value="s.jsonText" aria-label="JSON" />
        <button type="button" class="cc-copy-btn" title="Copy JSON" @click="copy('json', s.jsonText)">{{ label.json }}</button>
      </div>
    </section>

    <section>
      <h3>CSS</h3>
      <p>Copy CSS classes for this scheme.</p>
      <div class="cc-copy-row">
        <input :ref="(el) => (inputs.css = el as HTMLInputElement)" type="text" readonly :value="s.cssText" aria-label="CSS" />
        <button type="button" class="cc-copy-btn" title="Copy CSS" @click="copy('css', s.cssText)">{{ label.css }}</button>
      </div>
    </section>
  </div>
</template>
