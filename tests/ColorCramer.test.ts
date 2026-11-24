// @vitest-environment happy-dom
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ColorCramer from '@/components/ColorCramer.vue'
import { getPalette } from '@/lib/palettes'

// a tiny stand-in for map.svg: q-classes for 12 and 6 classes
const MAP_SVG =
  '<svg width="756" height="581"><rect width="756" height="581"/><g>' +
  '<path class="q0-12 q0-6 q0-3" d="M0 0h10v10z"/>' +
  '<path class="q4-12 q2-6 q1-3" d="M20 0h10v10z"/>' +
  '<path class="q11-12 q5-6 q2-3" d="M40 0h10v10z"/>' +
  '</g></svg>'
const OVERLAYS_SVG = '<svg width="448" height="346"><g id="roads"><g id="road-lines"><line x1="0" y1="0" x2="5" y2="5"/></g></g><g id="cities"><circle r="2"/></g></svg>'

let fetchMock: ReturnType<typeof vi.fn>
let wrapper: VueWrapper | undefined

async function mountApp(search = ''): Promise<VueWrapper> {
  window.history.replaceState(null, '', '/colorcramer/' + search)
  wrapper = mount(ColorCramer, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

const rgb = (hex: string): string => hex

beforeEach(() => {
  fetchMock = vi.fn(async (url: string) => ({
    ok: true,
    text: async () => (String(url).includes('overlays') ? OVERLAYS_SVG : MAP_SVG)
  }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('ColorCramer', () => {
  it('starts with 6 sequential classes of Batlow', async () => {
    const w = await mountApp()
    expect(w.findAll('.cc-chips rect')).toHaveLength(6)
    expect(w.find('.cc-scheme-name').text()).toBe('6-class Batlow')
    expect(w.findAll('.cc-ramp')).toHaveLength(22)
    expect(w.find<HTMLTextAreaElement>('.cc-values textarea').element.value.split('\n')).toHaveLength(6)
    expect(w.find('.cc-ramp.selected').attributes('data-scheme')).toBe('Batlow')
  })

  it('follows the class slider and keeps the address bar in step', async () => {
    const w = await mountApp()
    await w.find('.cc-number-slider input').setValue(8)
    expect(w.findAll('.cc-chips rect')).toHaveLength(8)
    expect(w.find('.cc-scheme-name').text()).toBe('8-class Batlow')
    expect(window.location.search).toBe('?type=sequential&scheme=Batlow&n=8')
    expect(w.find<HTMLInputElement>('input[aria-label="Permalink"]').element.value).toContain('n=8')
  })

  it('warns when the class count is outside the range the map was designed for', async () => {
    const w = await mountApp()
    expect(w.find('.cc-number').classes()).not.toContain('cc-out-of-range')
    await w.find('.cc-number-slider input').setValue(20)
    expect(w.find('.cc-number').classes()).toContain('cc-out-of-range')
    expect(w.find('.cc-num-value').attributes('title')).toContain('3-12')
  })

  it('shows the number of palettes of each gradient type', async () => {
    const w = await mountApp()
    for (const [type, count] of [['diverging', 10], ['cyclic', 5], ['multi-sequential', 3], ['sequential', 22]] as const) {
      await w.find(`#cc-type-${type}`).setValue(true)
      expect(w.findAll('.cc-ramp'), type).toHaveLength(count)
    }
  })

  it('selects the first palette of a type when the current one is not in it', async () => {
    const w = await mountApp('?scheme=Oslo')
    expect(w.find('.cc-scheme-name').text()).toBe('6-class Oslo')
    await w.find('#cc-type-diverging').setValue(true)
    expect(w.find('.cc-scheme-name').text()).toBe('6-class Broc')
  })

  it('reverses the palette in the chips, values and exports', async () => {
    const w = await mountApp()
    const forward = getPalette('Batlow', 6)
    expect(w.findAll('.cc-chips rect')[0].attributes('fill')).toBe(rgb(forward[0]))

    await w.find('#cc-reverse').setValue(true)
    const chips = w.findAll('.cc-chips rect')
    expect(chips[0].attributes('fill')).toBe(forward[5])
    expect(chips[5].attributes('fill')).toBe(forward[0])
    expect(window.location.search).toContain('reverse=1')

    const json = JSON.parse(w.find<HTMLInputElement>('input[aria-label="JSON"]').element.value) as string[]
    expect(json).toHaveLength(6)
    const css = w.find<HTMLInputElement>('input[aria-label="CSS"]').element.value
    expect(css.startsWith(`.Batlow .q0-6{fill:${forward[5]}}`)).toBe(true)

    await w.find('#cc-reverse').setValue(false)
    expect(w.findAll('.cc-chips rect')[0].attributes('fill')).toBe(forward[0])
    expect(window.location.search).not.toContain('reverse')
  })

  it('falls back to defaults for invalid parameters', async () => {
    const w = await mountApp('?scheme=BuGn&n=1000000&type=)')
    expect(w.findAll('.cc-chips rect')).toHaveLength(50)
    expect(w.find('.cc-scheme-name').text()).toBe('50-class Batlow')
    expect(window.location.search).toBe('?type=sequential&scheme=Batlow&n=50')
  })

  it('reads reverse from the address', async () => {
    const w = await mountApp('?reverse=1')
    expect(w.find<HTMLInputElement>('#cc-reverse').element.checked).toBe(true)
    expect(w.findAll('.cc-chips rect')[0].attributes('fill')).toBe(getPalette('Batlow', 6)[5])
  })

  it('switches the vision deficiency filter', async () => {
    const w = await mountApp()
    expect(w.classes().some((c) => c.startsWith('cc-vision-'))).toBe(false)
    await w.find('select[aria-label="Emulate vision"]').setValue('protanopia')
    expect(w.classes()).toContain('cc-vision-protanopia')
    await w.find('select[aria-label="Emulate vision"]').setValue('')
    expect(w.classes().some((c) => c.startsWith('cc-vision-'))).toBe(false)
    expect(document.querySelector('filter#cc-cvd-protanopia feColorMatrix')).not.toBeNull()
  })

  it('switches the color system of the values and the JSON export', async () => {
    const w = await mountApp()
    const values = (): string => w.find<HTMLTextAreaElement>('.cc-values textarea').element.value
    const json = (): string[] => JSON.parse(w.find<HTMLInputElement>('input[aria-label="JSON"]').element.value)
    expect(values().split('\n')[0]).toMatch(/^#[0-9a-f]{6}$/)
    await w.find('select[aria-label="Color system"]').setValue('rgb')
    expect(values().split('\n')[0]).toMatch(/^\d+,\d+,\d+$/)
    expect(json()[0]).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
    await w.find('select[aria-label="Color system"]').setValue('cmyk')
    expect(values().split('\n')[0]).toMatch(/^\d+,\d+,\d+,\d+$/)
    expect(json()[0]).toMatch(/^cmyk\(\d+,\d+,\d+,\d+\)$/)
  })

  it('copies the permalink, JSON and CSS with the copy buttons', async () => {
    const writeText = vi.fn(async () => undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal('isSecureContext', true)
    const w = await mountApp()
    const buttons = w.findAll('.cc-copy-btn')
    expect(buttons).toHaveLength(3)

    await buttons[0].trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenLastCalledWith(w.find<HTMLInputElement>('input[aria-label="Permalink"]').element.value)
    expect(buttons[0].text()).toBe('copied')

    await buttons[1].trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenLastCalledWith(w.find<HTMLInputElement>('input[aria-label="JSON"]').element.value)

    await buttons[2].trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenLastCalledWith(w.find<HTMLInputElement>('input[aria-label="CSS"]').element.value)
  })

  it('shows "failed" when nothing can be copied', async () => {
    vi.stubGlobal('navigator', {})
    const w = await mountApp()
    const button = w.findAll('.cc-copy-btn')[0]
    await button.trigger('click')
    await flushPromises()
    expect(button.text()).toBe('failed')
  })

  it('opens and closes the share panel', async () => {
    const w = await mountApp()
    expect(w.find('.cc-share').classes()).not.toContain('open')
    await w.find('.cc-share-tab').trigger('click')
    expect(w.find('.cc-share').classes()).toContain('open')
    await w.find('.cc-share-tab').trigger('click')
    expect(w.find('.cc-share').classes()).not.toContain('open')
  })

  it('opens an info popup from a learn-more icon and closes it with Escape', async () => {
    const w = await mountApp()
    expect(w.find('.cc-modal').exists()).toBe(false)
    await w.find('button[aria-label="About gradient types"]').trigger('click')
    expect(w.find('.cc-modal-title').text()).toContain('GRADIENT TYPES')
    expect(w.find('.cc-modal-content').text()).toContain('Sequential Gradients')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(w.find('.cc-modal').exists()).toBe(false)

    await w.find('.cc-nav a').trigger('click')
    expect(w.find('.cc-modal-title').text()).toContain('HOW TO USE')
    await w.find('.cc-mask').trigger('click')
    expect(w.find('.cc-modal').exists()).toBe(false)
  })

  describe('map', () => {
    it('loads the map and writes the fill rules of the palette', async () => {
      const w = await mountApp()
      expect(fetchMock).toHaveBeenCalledWith('/map/map.svg')
      expect(w.find('.cc-map svg').exists()).toBe(true)
      expect(w.find('.cc-loading').exists()).toBe(false)
      const css = w.find('.cc-map-box style').text()
      expect(css).toContain('.cc-map .q0-6{fill:')
      expect(css).not.toContain('stroke:rgb')

      await w.find('#cc-borders').setValue(false)
      expect(w.find('.cc-map-box style').text()).toContain('stroke-width:1px')
    })

    it('derives classes for class counts outside 3-12', async () => {
      const w = await mountApp()
      await w.find('.cc-number-slider input').setValue(20)
      const classes = w.findAll('.cc-map path').map((p) => p.attributes('class'))
      expect(classes[1]).toContain('q7-20')
      expect(classes[0]).toContain('q0-20')
    })

    it('shows the colors of a path in the tooltip', async () => {
      const w = await mountApp()
      const palette = getPalette('Batlow', 6)
      await w.findAll('.cc-map path')[1].trigger('mouseover')
      expect(w.find('.cc-probe').isVisible()).toBe(true)
      expect(w.find('.cc-probe').text()).toContain('Batlow class 3')
      const [r, g, b] = palette[2].match(/\d+/g)!
      expect(w.find('.cc-probe').text()).toContain(`RGB: ${r},${g},${b}`)
      expect(w.findAll('.cc-map g path')).toHaveLength(4) // the outline is a clone of the hovered path

      await w.find('.cc-map').trigger('mouseleave')
      expect(w.find('.cc-probe').isVisible()).toBe(false)
      expect(w.findAll('.cc-map g path')).toHaveLength(3)
    })

    it('fetches the overlays once, however the checkboxes are used', async () => {
      const w = await mountApp()
      const overlayCalls = (): number => fetchMock.mock.calls.filter(([u]) => String(u).includes('overlays')).length
      expect(overlayCalls()).toBe(0)
      await w.find('#cc-roads').setValue(true)
      await w.find('#cc-cities').setValue(true)
      await flushPromises()
      await w.find('#cc-roads').setValue(false)
      await w.find('#cc-roads').setValue(true)
      await flushPromises()
      expect(overlayCalls()).toBe(1)
      expect(w.find('.cc-overlays #roads').exists()).toBe(true)
      expect(w.find('.cc-map-box').classes()).toEqual(expect.arrayContaining(['cc-roads-on', 'cc-cities-on']))
      await w.find('#cc-cities').setValue(false)
      expect(w.find('.cc-map-box').classes()).not.toContain('cc-cities-on')
    })

    it('gives terrain a default transparency and undoes it when going back', async () => {
      const w = await mountApp()
      const slider = (): HTMLInputElement => w.find<HTMLInputElement>('.cc-transparency input').element
      expect(slider().value).toBe('0')
      await w.find('#cc-terrain').setValue(true)
      expect(slider().value).toBe('50')
      expect(w.find('.cc-terrain').exists()).toBe(true)
      expect(w.find('.cc-map-box').classes()).toContain('cc-terrain-on')
      await w.find('#cc-solid').setValue(true)
      expect(slider().value).toBe('0')
      expect(w.find('.cc-map-box').classes()).not.toContain('cc-terrain-on')

      // a transparency chosen by the user is kept
      await w.find('.cc-transparency input').setValue(30)
      await w.find('#cc-terrain').setValue(true)
      await w.find('#cc-solid').setValue(true)
      expect(slider().value).toBe('30')
    })

    it('shows a message when the map cannot be loaded', async () => {
      fetchMock.mockImplementation(async () => ({ ok: false, status: 404, text: async () => '' }))
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const w = await mountApp()
      expect(w.find('.cc-map-error').text()).toContain('could not be loaded')
    })
  })
})
