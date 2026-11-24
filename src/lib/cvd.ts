// Color vision deficiency emulation: 3x3 matrices applied in linear RGB.
// Protanopia, deuteranopia and tritanopia: Machado, Oliveira and Fernandes (2009), severity 1.0.
// Achromatopsia: linear luminance.

export type VisionKind = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

export type Matrix3 = [[number, number, number], [number, number, number], [number, number, number]]

const LUMINANCE: [number, number, number] = [0.2126, 0.7152, 0.0722]

export const visionMatrices: Record<VisionKind, Matrix3> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998]
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881]
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039]
  ],
  achromatopsia: [LUMINANCE, LUMINANCE, LUMINANCE]
}

export const visionOptions: { value: '' | VisionKind; label: string }[] = [
  { value: '', label: 'Normal vision' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
  { value: 'achromatopsia', label: 'Achromatopsia' }
]

/** The 20 numbers of an SVG feColorMatrix (5x4, row major) for a 3x3 matrix, alpha unchanged. */
export function colorMatrixValues(m: Matrix3): string {
  const rows = m.map((row) => `${row.join(' ')} 0 0`)
  return [...rows, '0 0 0 1 0'].join(' ')
}

export function filterId(kind: VisionKind): string {
  return `cc-cvd-${kind}`
}
