import { rng, type Sketch } from './paint'

/**
 * Self-portrait painted in code. A tiny colour reference (168x252, never the photo itself) tells the sketch where
 * the tones and edges are; the sketch then lays watercolour washes and hundreds of pen strokes that follow the form.
 */
export type Ref = { w: number; h: number; lum: Float32Array; rgb: Uint8ClampedArray }

export async function loadRef(url = '/lab/portrait-ref.png'): Promise<Ref> {
  const img = new Image(); img.src = url; await img.decode()
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
  const x = c.getContext('2d', { willReadFrequently: true })!
  x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, c.width, c.height).data
  const lum = new Float32Array(c.width * c.height)
  for (let i = 0; i < lum.length; i++) lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255
  return { w: c.width, h: c.height, lum, rgb: d }
}

// <portrait>
export const makePortrait = (ref: Ref): Sketch => (b, W, H) => {
  const R = rng(42)
  const { w, h, lum, rgb } = ref
  const sx = W / w, sy = H / h
  const cl = (v: number, m: number) => Math.max(0, Math.min(m - 1, v | 0))
  const L = (x: number, y: number) => lum[cl(y, h) * w + cl(x, w)]
  const col = (x: number, y: number, k = 1): string => {
    const i = (cl(y, h) * w + cl(x, w)) * 4
    return `rgb(${(rgb[i] * k) | 0},${(rgb[i + 1] * k) | 0},${(rgb[i + 2] * k) | 0})`
  }
  const backdrop = (x: number, y: number) => { const i = (cl(y, h) * w + cl(x, w)) * 4; return L(x, y) > 0.9 && Math.abs(rgb[i] - rgb[i + 2]) < 14 }
  const grad = (x: number, y: number) => Math.hypot(L(x + 1.5, y) - L(x - 1.5, y), L(x, y + 1.5) - L(x, y - 1.5))
  // where the face is (feature detail gets extra attention)
  const inFace = (x: number, y: number) => x > w * 0.3 && x < w * 0.7 && y > h * 0.12 && y < h * 0.62

  // 1. watercolour: blooms of local colour, skipping the white backdrop
  b.noStroke(); b.fillBleed(0.5); b.fillTexture(0.55, 0.5)
  for (let gy = 3; gy < h; gy += 6) for (let gx = 3; gx < w; gx += 6) {
    if (backdrop(gx, gy)) continue
    const face = inFace(gx, gy), l = L(gx, gy)
    b.fill(col(gx, gy, l < 0.3 ? 0.8 : 1), l < 0.3 ? 235 : face ? 175 : 150) // darker, denser washes in the shadows
    b.circle(gx * sx, gy * sy, face ? 8 + R() * 7 : 15 + R() * 11)
  }

  // 2. line work: strokes run along edges; short and dense in the face, longer on hair and sweater
  b.noFill()
  const draw = (x: number, y: number, len: number, k: number, brushName: string, weight: number) => {
    const gx = L(x + 1.5, y) - L(x - 1.5, y), gy = L(x, y + 1.5) - L(x, y - 1.5)
    const ang = Math.atan2(gy, gx) + Math.PI / 2 + (R() - 0.5) * 0.5
    b.set(brushName, col(x, y, k), weight)
    b.line(x * sx, y * sy, (x + Math.cos(ang) * len) * sx, (y + Math.sin(ang) * len) * sy)
  }
  for (let i = 0; i < 5200; i++) {
    const x = R() * w, y = R() * h
    if (backdrop(x, y)) continue
    const dark = 1 - L(x, y), g = grad(x, y), face = inFace(x, y)
    if (R() > 0.04 + dark * 0.85 + g * (face ? 5 : 2.2)) continue
    const len = face ? 1.6 + R() * 3 : 3 + dark * 7 + R() * 3
    draw(x, y, len, face ? 0.35 : 0.5, dark > 0.5 ? '2B' : 'pen', face ? 0.3 + g * 1.6 : 0.35 + dark * 0.5)
  }
  // 3. features: a final, confident pass wherever the face has strong tonal edges (eyes, brows, nostrils, lips)
  for (let i = 0; i < 2400; i++) {
    const x = w * 0.3 + R() * w * 0.4, y = h * 0.12 + R() * h * 0.5
    const g = grad(x, y)
    if (g < 0.07 || R() > g * 5) continue
    draw(x, y, 1.5 + g * 9, 0.28, 'rotring', 0.45 + g * 1.4)
  }
  // 4. hair and sweater: loose charcoal
  for (let i = 0; i < 360; i++) {
    const x = R() * w, y = R() * h
    if (backdrop(x, y) || L(x, y) > 0.2) continue
    b.set('charcoal', '#120d0a', 0.5 + R() * 0.5)
    b.line(x * sx, y * sy, (x + (R() - 0.5) * 8) * sx, (y + 4 + R() * 9) * sy)
  }
}
// </portrait>
