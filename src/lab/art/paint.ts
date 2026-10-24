import * as brush from 'p5.brush/standalone'

/**
 * Paint-with-code engine. A sketch is a plain function that draws with p5.brush (pencils, charcoal, watercolour,
 * hatching, vector fields). p5.brush keeps GPU state tied to one canvas, so every painting is rendered on a single
 * shared master canvas, cropped out as an image, and cached. A page can then show many paintings cheaply.
 */
export type B = typeof brush
export type Sketch = (b: B, W: number, H: number) => void
export type PaintOpts = { W: number; H: number; bg?: string; seed?: number; layers?: number }

import { runLayers } from './layers'
export { layer, lastLayerCount } from './layers'

const MW = 2000, MH = 1500
let master: HTMLCanvasElement | null = null
const cache = new Map<string, string>()
let busy: Promise<unknown> = Promise.resolve()

function init() {
  if (master) return master
  master = document.createElement('canvas')
  master.width = MW; master.height = MH
  brush.load(master)
  brush.angleMode(brush.DEGREES)
  brush.scaleBrushes(4) // once: brushes are tiny by default for a canvas this size
  return master
}

export function paintToImage(key: string, sketch: Sketch, { W, H, bg = '#efe6d4', seed = 1, layers = Infinity }: PaintOpts): Promise<string> {
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  const run = busy.then(() => new Promise<string>((resolve, reject) => {
    try {
      const canvas = init()
      const s = Math.min(MW / W, MH / H, 1.5) // pixel density of this painting
      brush.seed(seed); brush.noiseSeed(seed)
      brush.clear(bg)
      brush.push()
      brush.translate(-MW / 2, -MH / 2)
      brush.scale(s)
      brush.noField(); brush.noFill(); brush.noHatch(); brush.noMass(); brush.noWash(); brush.noClip()
      runLayers(() => sketch(brush, W, H), layers)
      brush.pop()
      brush.render()
      // crop the painted region out of the master canvas
      const out = document.createElement('canvas')
      out.width = Math.round(W * s); out.height = Math.round(H * s)
      out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height, 0, 0, out.width, out.height)
      const url = out.toDataURL('image/jpeg', 0.92)
      cache.set(key, url)
      resolve(url)
    } catch (e) { reject(e) }
  }))
  busy = run.catch(() => undefined)
  return run
}

/** Seeded random helper for sketches that want their own stream. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}
