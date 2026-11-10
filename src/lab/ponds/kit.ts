/** Shared bits for the pond testing room: the pond contract, seeded randomness, value noise and offscreen layers. */
export type Pointer = { x: number; y: number; on: boolean }
export type Instance = { frame: (t: number, p: Pointer) => void; click?: (x: number, y: number) => void; cursor?: () => string }
export type PondDef = {
  id: string
  name: string
  tags: string[]
  idea: string
  hint: string
  bg: string
  /** runs by itself: the cursor does nothing */
  passive?: boolean
  /** the canvas's shape in the lab, as a css aspect-ratio (16/10 if absent) */
  aspect?: string
  make: (ctx: CanvasRenderingContext2D, w: number, h: number) => Instance
}

export const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const sm = (t: number) => t * t * (3 - 2 * t)
/** Smooth value noise in 0..1. */
export const noise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
export const fbm = (x: number, y: number) => (noise(x, y) * 0.62 + noise(x * 2.1 + 17, y * 2.1 + 5) * 0.28 + noise(x * 4.3 + 3, y * 4.3 + 41) * 0.1)

export const DPR = () => Math.min(devicePixelRatio || 1, 2)
/** An offscreen canvas drawn in css px (sharp on retina). Draw it back with ctx.drawImage(l.c, 0, 0, w, h). */
export const layer = (w: number, h: number) => {
  const c = document.createElement('canvas'), d = DPR()
  c.width = Math.max(1, Math.round(w * d)); c.height = Math.max(1, Math.round(h * d))
  const x = c.getContext('2d')!
  x.setTransform(d, 0, 0, d, 0, 0)
  return { c, x }
}
export const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)]
export const dab = (x: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, a: number, fill: string) => {
  x.fillStyle = fill; x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, Math.PI * 2); x.fill()
}
