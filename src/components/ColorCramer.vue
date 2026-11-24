<script setup lang="ts">
import { CRAMERI_RELEASE } from '@/data/colormaps'
import githubMark from '@/assets/GitHub-Mark-32px.png'
import ColorPanel from './ColorPanel.vue'
import CvdFilters from './CvdFilters.vue'
import InfoModal from './InfoModal.vue'
import MapView from './MapView.vue'
import OptionsPanel from './OptionsPanel.vue'
import PalettePicker from './PalettePicker.vue'
import SharePanel from './SharePanel.vue'
import { provideState } from './useColorCramer'
import './colorcramer.css'

const s = provideState()
</script>

<template>
  <div class="cc" :class="s.vision ? `cc-vision-${s.vision}` : ''">
    <CvdFilters />

    <div class="cc-wrapper">
      <div class="cc-left">
        <PalettePicker />
        <div class="cc-colors">
          <OptionsPanel />
          <ColorPanel />
          <SharePanel />
        </div>
      </div>

      <div class="cc-main">
        <div class="cc-header">
          <p class="cc-nav">
            <a href="#" @click.prevent="s.infoPage = 'how'">how to use</a> |
            <a href="#" @click.prevent="s.infoPage = 'credits'">credits</a>
          </p>
          <h1>COLOR<span>CRAMER</span></h1>
          <h3>color advice for cartography</h3>
        </div>
        <MapView />
      </div>
    </div>

    <div class="cc-footer">
      <p>
        <img :src="githubMark" alt="" />
        <a href="https://github.com/royfrancis/colorcramer" target="_blank" rel="noopener">Source code</a>,
        <a :href="CRAMERI_RELEASE.url" target="_blank" rel="noopener">Palette data (Crameri v{{ CRAMERI_RELEASE.version }})</a>,
        <a href="https://www.fabiocrameri.ch/colourmaps/" target="_blank" rel="noopener">Fabio Crameri</a>
      </p>
    </div>

    <InfoModal />
  </div>
</template>
