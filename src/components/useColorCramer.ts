import { computed, inject, provide, reactive, ref, watch, type InjectionKey } from 'vue'
import { schemeNames, type SchemeType } from '@/data/schemes'
import { formatColors, type ColorSystem } from '@/lib/color'
import type { VisionKind } from '@/lib/cvd'
import { cssExport, jsonExport } from '@/lib/exports'
import { isMapRange } from '@/lib/mapClasses'
import { buildUrl, clampClasses, parseParams } from '@/lib/params'
import { getPalette } from '@/lib/palettes'

export type Background = 'solid' | 'terrain'
export type InfoPage = 'number' | 'schemes' | 'context' | 'how' | 'credits'

/** Transparency (percent) given to the colors when switching to the terrain background. */
export const TERRAIN_DEFAULT_TRANSPARENCY = 50

export function createState() {
  const initial = parseParams(typeof window !== 'undefined' ? window.location.search : '')

  const type = ref<SchemeType>(initial.type)
  const scheme = ref(initial.scheme)
  const n = ref(initial.n)
  const reversed = ref(initial.reversed)
  const system = ref<ColorSystem>('hex')
  const vision = ref<'' | VisionKind>('')

  const roads = ref(false)
  const cities = ref(false)
  const borders = ref(true)
  const roadColor = ref('#ff3333')
  const cityColor = ref('#000000')
  const borderColor = ref('#000000')
  const bgColor = ref('#ffffff')
  const background = ref<Background>('solid')
  const transparency = ref(0)
  let transparencyAuto = false

  const shareOpen = ref(false)
  const infoPage = ref<InfoPage | null>(null)
  const permalink = ref('')

  const ramps = computed(() => schemeNames[type.value])
  const colors = computed(() => getPalette(scheme.value, n.value, reversed.value))
  const formatted = computed(() => formatColors(colors.value, system.value))
  const cssText = computed(() => cssExport(scheme.value, colors.value))
  const jsonText = computed(() => jsonExport(formatted.value.list))
  const outOfMapRange = computed(() => !isMapRange(n.value))

  function setType(t: SchemeType): void {
    type.value = t
    if (!schemeNames[t].includes(scheme.value)) scheme.value = schemeNames[t][0]
  }

  function setClasses(value: unknown): void {
    n.value = clampClasses(value)
  }

  /** Switching to terrain gives the colors a default transparency; switching back undoes it if the user did not change it. */
  function setBackground(mode: Background): void {
    background.value = mode
    if (mode === 'terrain') {
      if (transparency.value === 0) {
        transparency.value = TERRAIN_DEFAULT_TRANSPARENCY
        transparencyAuto = true
      }
    } else if (transparencyAuto) {
      transparency.value = 0
      transparencyAuto = false
    }
  }

  function setTransparency(value: number): void {
    transparencyAuto = false
    transparency.value = value
  }

  // keep the address bar and the permalink in step with the selection
  watch(
    [type, scheme, n, reversed],
    () => {
      if (typeof window === 'undefined') return
      const url = buildUrl(window.location.href, {
        type: type.value,
        scheme: scheme.value,
        n: n.value,
        reversed: reversed.value
      })
      permalink.value = url
      try {
        window.history.replaceState(null, document.title, url)
      } catch {
        // replaceState can be refused (for example on file:// pages)
      }
    },
    { immediate: true }
  )

  return reactive({
    type,
    scheme,
    n,
    reversed,
    system,
    vision,
    roads,
    cities,
    borders,
    roadColor,
    cityColor,
    borderColor,
    bgColor,
    background,
    transparency,
    shareOpen,
    infoPage,
    permalink,
    ramps,
    colors,
    formatted,
    cssText,
    jsonText,
    outOfMapRange,
    setType,
    setClasses,
    setBackground,
    setTransparency
  })
}

export type State = ReturnType<typeof createState>

const key: InjectionKey<State> = Symbol('colorcramer-state')

export function provideState(): State {
  const state = createState()
  provide(key, state)
  return state
}

export function useState(): State {
  const state = inject(key)
  if (!state) throw new Error('ColorCramer state is not provided')
  return state
}
