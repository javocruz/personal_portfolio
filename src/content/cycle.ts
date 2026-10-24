import type { L } from './types'

/**
 * Complete's home tells Thomas Cole's The Course of Empire (1836) as you scroll, starting from its ending:
 * Böcklin's Isle of the Dead. Each section has one painting behind it; one becomes the next through a dither dissolve.
 */
export type StageId = 'isle' | 'savage' | 'arcadian' | 'consummation' | 'destruction' | 'desolation' | 'contact'
export type Enter = 'rise' | 'sweep-right' | 'centre' | 'from-fire' | 'fall' | 'close-in'

export type Stage = {
  id: StageId
  /** wall label, e.g. "The Savage State" */
  title: L
  artist: string
  year: number
  /** base path: `${img}-${960|1920}.${avif|webp|jpg}`; empty = plain black */
  img: string
  /** the isle reuses the hero's own JPEG (already in the cache), so it has no AVIF/WebP */
  jpgOnly?: boolean
  /** size of the original painting, so the 16:9 crop can be worked out the same way here and in the bake script */
  src: { w: number; h: number }
  /** the focal point in the original painting, 0..1 (crop centre, phone framing, and where centre/fire dissolves start) */
  focus: { x: number; y: number }
  /** which side the section text sits on, away from the action */
  textSide: 'left' | 'right'
  palette: { accent: string; dotHi: string; dotLo: string; glow: string; smoke: string }
  /** the dissolve shape INTO this stage */
  enter: Enter
}

export const stages: Stage[] = [
  {
    id: 'isle', title: { en: 'Isle of the Dead', es: 'La isla de los muertos' }, artist: 'Arnold Böcklin', year: 1883,
    img: '/art/isle-dusk', jpgOnly: true, src: { w: 1920, h: 1023 }, focus: { x: 0.5, y: 0.5 }, textSide: 'left',
    palette: { accent: '#e9e1d3', dotHi: '#d8cfbf', dotLo: '#0b0907', glow: '#f2d6a6', smoke: '#07080a' }, enter: 'rise',
  },
  {
    id: 'savage', title: { en: 'The Savage State', es: 'El estado salvaje' }, artist: 'Thomas Cole', year: 1836,
    img: '/art/cycle/savage', src: { w: 8880, h: 5520 }, focus: { x: 0.56, y: 0.42 }, textSide: 'right',
    palette: { accent: '#d9846b', dotHi: '#e7b08f', dotLo: '#0b0907', glow: '#ffb48a', smoke: '#0d0a09' }, enter: 'rise',
  },
  {
    id: 'arcadian', title: { en: 'The Arcadian or Pastoral State', es: 'El estado arcádico o pastoral' }, artist: 'Thomas Cole', year: 1836,
    img: '/art/cycle/arcadian', src: { w: 8733, h: 5442 }, focus: { x: 0.36, y: 0.46 }, textSide: 'right',
    palette: { accent: '#d8b25a', dotHi: '#efd59a', dotLo: '#0b0907', glow: '#ffe3a1', smoke: '#0c0b07' }, enter: 'sweep-right',
  },
  {
    id: 'consummation', title: { en: 'The Consummation of Empire', es: 'La consumación del imperio' }, artist: 'Thomas Cole', year: 1836,
    img: '/art/cycle/consummation', src: { w: 7784, h: 5277 }, focus: { x: 0.5, y: 0.5 }, textSide: 'left',
    palette: { accent: '#f0d79a', dotHi: '#f3e6c4', dotLo: '#0b0907', glow: '#fff0c4', smoke: '#0d0b08' }, enter: 'centre',
  },
  {
    id: 'destruction', title: { en: 'Destruction', es: 'Destrucción' }, artist: 'Thomas Cole', year: 1836,
    img: '/art/cycle/destruction', src: { w: 8917, h: 5532 }, focus: { x: 0.42, y: 0.7 }, textSide: 'left',
    palette: { accent: '#e0552b', dotHi: '#ff7a3d', dotLo: '#0b0907', glow: '#ffa040', smoke: '#0e0806' }, enter: 'from-fire',
  },
  {
    id: 'desolation', title: { en: 'Desolation', es: 'Desolación' }, artist: 'Thomas Cole', year: 1836,
    img: '/art/cycle/desolation', src: { w: 8881, h: 5526 }, focus: { x: 0.5, y: 0.42 }, textSide: 'right',
    palette: { accent: '#a9b4bf', dotHi: '#c9d1d8', dotLo: '#0b0907', glow: '#e4ecf5', smoke: '#07090b' }, enter: 'fall',
  },
  {
    id: 'contact', title: { en: 'Eye of Nature', es: 'Eye of Nature' }, artist: 'Dan Hillier', year: 0,
    img: '', src: { w: 16, h: 9 }, focus: { x: 0.5, y: 0.5 }, textSide: 'left',
    palette: { accent: '#d98a4e', dotHi: '#9a5a30', dotLo: '#000000', glow: '#ffb070', smoke: '#000000' }, enter: 'close-in',
  },
]

export const stageById = Object.fromEntries(stages.map((s) => [s.id, s])) as Record<StageId, Stage>

const WIDE = 16 / 9
/** The 16:9 window cut from the original, centred on the focus and kept inside the painting (fractions of w/h). */
export function crop(s: Stage) {
  const a = s.src.w / s.src.h
  if (s.jpgOnly || Math.abs(a - WIDE) < 0.01) return { x: 0, y: 0, w: 1, h: 1 }
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  if (a < WIDE) { const h = a / WIDE; return { x: 0, y: clamp(s.focus.y - h / 2, 0, 1 - h), w: 1, h } }
  const w = WIDE / a
  return { x: clamp(s.focus.x - w / 2, 0, 1 - w), y: 0, w, h: 1 }
}

/** The focus inside the baked (cropped) image, 0..1. */
export function bakedFocus(s: Stage) {
  const c = crop(s)
  return { x: (s.focus.x - c.x) / c.w, y: (s.focus.y - c.y) / c.h }
}

/** Aspect of the baked image the shader receives. */
export const bakedAspect = (s: Stage) => (s.jpgOnly || !s.img ? s.src.w / s.src.h : WIDE)

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
/** "Plate II · Thomas Cole, The Savage State, 1836" */
export const wallLabel = (s: Stage, i: number, lang: 'en' | 'es') =>
  `${lang === 'es' ? 'Lámina' : 'Plate'} ${ROMAN[i]} · ${s.artist}, ${s.title[lang]}, ${s.year}`
