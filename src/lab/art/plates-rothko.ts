import { rng, layer, type B, type Sketch } from './paint'

/**
 * Core, Rothko style: the same five projects as colour fields. Two to four soft rectangles float on a warm ground,
 * each built from thin translucent washes until the edges glow. The project's numbers set the sizes and colours.
 * Same rules as plates.ts: seeded, one layer() per recipe step, baked to JPG.
 */
const GROUND = '#f1e2cc', M = 56 // the margin the fields float in

/**
 * One field: several thin washes, each a little bigger or smaller than the last, so the edge feathers and glows.
 * `soft` 0..1 makes the edge bleed more; `alpha` is per wash.
 */
function field(b: B, R: () => number, x: number, y: number, w: number, h: number, col: string, { passes = 8, alpha = 34, soft = 0.3 } = {}) {
  b.noStroke()
  // the body: flat washes, each a little smaller than the last, so the colour thickens towards the middle
  const deep = Math.min(10 + soft * 24, w * 0.14, h * 0.14)
  for (let i = 0; i < 5; i++) { const d = (deep * i) / 4 + (R() - 0.5) * 3; b.wash(col, alpha); b.rect(x + d, y + d, w - d * 2, h - d * 2) }
  b.noWash()
  // then thin watercolour washes, each a slightly different size, that bleed just past the edge so it feathers and glows
  for (let i = 0; i < passes; i++) {
    const d = (R() - 0.6) * (4 + soft * 12), e = (R() - 0.6) * (4 + soft * 12)
    b.fill(col, alpha * 0.7); b.fillBleed(0.04 + soft * 0.1 + R() * 0.03, 'out'); b.fillTexture(0.1, 0, false)
    b.rect(x + d, y + e, w - d * 2, h - e * 2)
  }
  b.noFill()
}
function stain(b: B, R: () => number, W: number, H: number, col = GROUND) {
  b.noStroke(); b.wash(col, 255); b.rect(0, 0, W, H); b.noWash()
  for (let i = 0; i < 3; i++) { b.fill(i ? '#ecd3b4' : col, 40); b.fillBleed(0.2); b.fillTexture(0.15, 0, false); b.rect(-20 + R() * 20, -20 + R() * 20, W + 20, H + 20) }
  b.noFill()
}
function glaze(b: B, W: number, H: number, col = '#e8b58a') { b.noStroke(); b.fill(col, 16); b.fillBleed(0.1); b.fillTexture(0.15, 0, false); b.rect(0, 0, W, H); b.noFill() }

// <plate:frost>
// SnapFrost: a night-blue field over a pale frost field, their heights in the ratio 1.50 : 1.29 (ECMWF's error to
// ours). The glowing gap between them is the 0.21 °C we took off.
export const rothkoFrost: Sketch = (b, W, H) => {
  const R = rng(31)
  const ecmwf = 1.5, ours = 1.29, gain = ecmwf - ours
  const u = (H - M * 2) / (ecmwf + gain + ours) // px per °C
  const y1 = M + ecmwf * u, y2 = y1 + gain * u
  layer('Ground stain')
  stain(b, R, W, H, '#efe3d2')
  layer('Night, 1.50 °C')
  field(b, R, M, M, W - M * 2, ecmwf * u, '#16224a', { passes: 9, alpha: 62 })
  field(b, R, M + 24, M + 30, W - M * 2 - 48, ecmwf * u - 60, '#2c3f78', { passes: 5, alpha: 22, soft: 0.6 }) // the inner light
  layer('The gap, 0.21 °C')
  field(b, R, M + 10, y1 - 4, W - M * 2 - 20, gain * u + 8, '#fbe9b8', { passes: 7, alpha: 30, soft: 0.8 })
  layer('Frost, 1.29 °C')
  field(b, R, M, y2, W - M * 2, ours * u, '#a9bfd4', { passes: 10, alpha: 36 })
  field(b, R, M + 20, y2 + 24, W - M * 2 - 40, ours * u - 48, '#e6edf1', { passes: 5, alpha: 22, soft: 0.6 })
  layer('Glaze')
  glaze(b, W, H, '#dfc7a8')
}
// </plate:frost>

// <plate:maps>
// Los Panaderos: two ember fields of one hue. Above, the fire now. Below, what the control room knows: 12 steps out of
// 30 behind, so it is 18/30 the size, dimmer, and its edges have gone soft like an old picture.
export const rothkoMaps: Sketch = (b, W, H) => {
  const R = rng(17)
  const T = 30, LAG = 12, seen = (T - LAG) / T
  const fh = (H - M * 2 - 40) / (1 + seen) // the real fire's height; the known fire is `seen` of it
  layer('Ground stain')
  stain(b, R, W, H, '#f0d9bf')
  layer('The real fire')
  field(b, R, M, M, W - M * 2, fh, '#b8361a', { passes: 9, alpha: 42 })
  field(b, R, M + 30, M + 40, W - M * 2 - 60, fh - 80, '#e2622a', { passes: 6, alpha: 26, soft: 0.5 })
  layer('What the control room knows, 12 steps behind')
  const kw = (W - M * 2) * seen, kx = M + ((W - M * 2) - kw) / 2, ky = M + fh + 40
  field(b, R, kx, ky, kw, fh * seen, '#b8361a', { passes: 7, alpha: 20, soft: 1 })
  field(b, R, kx + 20, ky + 20, kw - 40, fh * seen - 40, '#e2622a', { passes: 4, alpha: 12, soft: 1 })
  layer('Glaze')
  glaze(b, W, H)
}
// </plate:maps>

// <plate:iris>
// Sybol engine: one field from authentic (1.0, left) to deepfake (0.0, right). Calm blue turns to agitated red, and the
// edges get rougher and bleed more as the score falls.
export const rothkoIris: Sketch = (b, W, H) => {
  const R = rng(21)
  const n = 12, sw = (W - M * 2) / n
  const mix = (a: string, c: string, k: number) => '#' + [1, 3, 5].map((o) => Math.round(parseInt(a.slice(o, o + 2), 16) * (1 - k) + parseInt(c.slice(o, o + 2), 16) * k).toString(16).padStart(2, '0')).join('')
  const slice = (i: number) => {
    const score = 1 - i / (n - 1), rough = 1 - score
    const jag = rough * 46 * (R() - 0.3) // the top and bottom edges stop lining up
    field(b, R, M + i * sw - sw * 0.4, M + 60 + jag, sw * 1.8, H - M * 2 - 160 - jag * 2, mix('#2d5a8a', '#b52a1d', rough), { passes: 6, alpha: 26, soft: rough * 1.2 })
  }
  layer('Ground stain')
  stain(b, R, W, H, '#f2e4d0')
  layer('Authentic, calm')
  for (let i = 0; i < n / 2; i++) slice(i)
  layer('Deepfake, agitated')
  for (let i = n / 2; i < n; i++) slice(i)
  layer('Glaze')
  glaze(b, W, H)
}
// </plate:iris>

// <plate:chain>
// Pharmable: 7 thin bands stacked like a ledger, one per block in the hash chain. Band 5 carries the critical finding:
// deep red, bleeding into the blocks on either side.
export const rothkoChain: Sketch = (b, W, H) => {
  const R = rng(9)
  const n = 7, critical = 4, gap = 14, bh = (H - M * 2 - gap * (n - 1)) / n
  const tones = ['#d9a441', '#c98a4a', '#d9a441', '#c98a4a', '#5e1310', '#c98a4a', '#d9a441']
  const band = (i: number) => field(b, R, M + 8, M + i * (bh + gap), W - M * 2 - 16, bh, tones[i], { passes: 7, alpha: i === critical ? 48 : 30, soft: 0.25 })
  layer('Ground stain')
  stain(b, R, W, H, '#f3e2ca')
  layer('Blocks 1 to 4')
  for (let i = 0; i < critical; i++) band(i)
  layer('Block 5, critical')
  band(critical)
  field(b, R, M - 6, M + critical * (bh + gap) - gap * 1.6, W - M * 2 + 12, bh + gap * 3.2, '#7a1f1a', { passes: 6, alpha: 26, soft: 1.4 }) // the bleed
  layer('Blocks 6 and 7')
  for (let i = critical + 1; i < n; i++) band(i)
  layer('Glaze')
  glaze(b, W, H)
}
// </plate:chain>

// <plate:hills>
// Frutas Prohibidas: three fields for one meal's impacts, stacked: orange CO₂ over olive land over blue water, each as
// tall as its share.
export const rothkoHills: Sketch = (b, W, H) => {
  const R = rng(4)
  // TODO(javi): confirm value. No impact figures in the code; these shares are the band heights of the original
  // plate (0.16, 0.17, 0.17 of the canvas).
  const share = [0.16 / 0.5, 0.17 / 0.5, 0.17 / 0.5], gap = 22
  const avail = H - M * 2 - gap * 2
  const ys = [M, M + share[0] * avail + gap, M + (share[0] + share[1]) * avail + gap * 2]
  const f = (k: number, col: string, inner: string) => {
    field(b, R, M, ys[k], W - M * 2, share[k] * avail, col, { passes: 9, alpha: 36 })
    field(b, R, M + 26, ys[k] + 22, W - M * 2 - 52, share[k] * avail - 44, inner, { passes: 4, alpha: 20, soft: 0.6 })
  }
  layer('Ground stain')
  stain(b, R, W, H, '#f2e3cc')
  layer('CO₂')
  f(0, '#e0662a', '#ee8a45')
  layer('Land')
  f(1, '#7d7a3a', '#97924c')
  layer('Water')
  f(2, '#3b5f86', '#557ba0')
  layer('Glaze')
  glaze(b, W, H)
}
// </plate:hills>

// seed: fixed per plate, so adding or reordering plates never changes an existing painting
export const PLATES_ROTHKO = [
  { id: 'frost', slug: 'snapfrost', sketch: rothkoFrost, seed: 7 },
  { id: 'maps', slug: 'los-panaderos', sketch: rothkoMaps, seed: 8 },
  { id: 'iris', slug: 'sybol-compliance-engine', sketch: rothkoIris, seed: 5 },
  { id: 'chain', slug: 'pharmable', sketch: rothkoChain, seed: 3 },
  { id: 'hills', slug: 'frutas-prohibidas', sketch: rothkoHills, seed: 6 },
] as const
