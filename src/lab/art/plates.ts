import { rng, layer, type Sketch } from './paint'

/**
 * Each plate is a short sketch painted with p5.brush from a real number in the project it illustrates.
 * The markers let the Plates page show the exact source ("view source"). Each layer() call starts a step of the
 * recipe; the site shows the painting as it stood after every step.
 */
const INK = '#17110c'

// <plate:fire>
// Los Panaderos: a fire front spreading up and to the right under wind, over a night sky wash.
export const plateFire: Sketch = (b, W, H) => {
  const R = rng(3)
  const wind = 16 // degrees of lean to the right
  layer('Night sky')
  b.noStroke(); b.fill('#1b2b5a', 170); b.fillBleed(0.5); b.fillTexture(0.6, 0.5)
  b.rect(36, 36, W - 72, H * 0.5)
  layer('Moon')
  b.fill('#f2d9a0', 150); b.circle(W * 0.78, H * 0.17, 46)
  layer('Fire front')
  // one flame stroke = a path that climbs, curls a little, and leans with the wind
  const flame = (x: number, y: number, len: number, curl: number) => {
    const pts: [number, number][] = [[x, y]]
    let a = -90 + wind + (R() - 0.5) * 30
    for (let d = 0; d < len; d += 14) {
      a += (R() - 0.5) * curl
      x += Math.cos((a * Math.PI) / 180) * 14; y += Math.sin((a * Math.PI) / 180) * 14
      pts.push([x, y])
    }
    return pts
  }
  for (let i = 0; i < 340; i++) {
    const heat = R()
    const x = W * 0.1 + R() * W * 0.8, y = H * 0.94 - R() * H * 0.06
    const len = H * (0.1 + Math.pow(R(), 1.4) * 0.52) * (1 - Math.abs(x - W / 2) / W)
    b.set(heat > 0.8 ? 'pastel' : heat > 0.35 ? 'charcoal' : '2B', heat > 0.86 ? '#f5c451' : heat > 0.5 ? '#ea5a2c' : heat > 0.2 ? '#a42d1a' : '#3a0f0a', 0.7 + R() * 1.5)
    b.spline(flame(x, y, len, 60), 1)
  }
  layer('Embers')
  b.set('pen', '#f5c451', 0.5)
  for (let i = 0; i < 60; i++) b.circle(W * 0.1 + R() * W * 0.8, H * (0.1 + R() * 0.75), 0.8 + R() * 2.5) // embers
  layer('Ground')
  b.noStroke(); b.fill('#14100d', 230); b.rect(0, H * 0.965, W, H * 0.04)
}
// </plate:fire>

// <plate:cost>
// IATA datathon: the abatement cost per tonne falling from $633 to $29, drawn as one descending stroke.
export const plateCost: Sketch = (b, W, H) => {
  const R = rng(5)
  const pts: [number, number][] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const cost = 29 + (633 - 29) * Math.exp(-4.2 * t)
    pts.push([70 + t * (W - 140), H * 0.18 + (1 - (cost - 29) / 604) * H * 0.62])
  }
  layer('Wash under the curve')
  b.noStroke(); b.fill('#1f6f6b', 175); b.fillBleed(0.5); b.fillTexture(0.55, 0.5)
  b.polygon([...pts, [W - 70, H * 0.84], [70, H * 0.84]])
  layer('The line, five passes')
  b.noFill()
  for (let k = 0; k < 5; k++) {
    b.set(k === 0 ? 'charcoal' : '2B', INK, 1.1 - k * 0.12)
    b.spline(pts.map(([x, y]) => [x + (R() - 0.5) * 5, y + (R() - 0.5) * 5 + k * 1.5]), 0.9)
  }
  layer('Axis ticks')
  b.set('HB', INK, 0.5)
  for (let i = 0; i <= 10; i++) b.line(70 + (i / 10) * (W - 140), H * 0.84, 70 + (i / 10) * (W - 140), H * 0.865)
  layer('$633 and $29')
  b.fill('#8c2a1b', 204); b.set('2B', INK, 0.6); b.circle(pts[0][0], pts[0][1], 20)
  b.fill('#1f6f6b', 230); b.circle(pts[24][0], pts[24][1], 8)
}
// </plate:cost>

// <plate:chain>
// Pharmable: a hash chain. Each block seals the one before it; one block carries a critical finding.
export const plateChain: Sketch = (b, W, H) => {
  const R = rng(9)
  const n = 7, bw = W * 0.5, bh = H * 0.085
  const xs = (i: number) => (i % 2 ? W * 0.14 : W * 0.36)
  const ys = (i: number) => H * 0.1 + i * (bh + H * 0.055)
  layer('Links')
  b.set('rotring', INK, 0.5)
  for (let i = 1; i < n; i++) b.line(xs(i - 1) + bw / 2, ys(i - 1) + bh, xs(i) + bw / 2, ys(i))
  layer('Blocks, one critical')
  b.noStroke(); b.fillBleed(0.4)
  for (let i = 0; i < n; i++) { b.fill(i === 4 ? '#8c2a1b' : '#2d5a45', i === 4 ? 179 : 89); b.rect(xs(i), ys(i), bw, bh) }
  layer('Hatching')
  b.set('HB', INK, 0.7); b.noFill()
  for (let i = 0; i < n; i++) { b.hatch(4 + (i % 3) * 2, 50 + i * 6, { rand: 0.1, continuous: true }); b.rect(xs(i), ys(i), bw, bh) }
  b.noHatch()
  layer('Hash nibbles')
  b.set('pen', INK, 0.35)
  for (let i = 0; i < n; i++) for (let k = 0; k < 6; k++) b.circle(xs(i) + 18 + k * 16, ys(i) + bh / 2, 2 + R() * 2)
}
// </plate:chain>

// <plate:stream>
// StreamScope: chat velocity over a stream. Most messages are noise; the gold strokes are the few worth surfacing.
export const plateStream: Sketch = (b, W, H) => {
  const R = rng(13)
  const n = 84, base = H * 0.8
  layer('Chat window wash')
  b.noStroke(); b.fill('#6a2c91', 70); b.fillBleed(0.6); b.fillTexture(0.5, 0.5)
  b.rect(40, H * 0.08, W - 80, H * 0.46)
  layer('Message velocity')
  b.noFill()
  for (let i = 0; i < n; i++) {
    const x = 70 + (i / (n - 1)) * (W - 140)
    const spike = [16, 37, 55, 71].some((s) => Math.abs(i - s) < 2)
    const h = H * (0.1 + 0.22 * Math.abs(Math.sin(i * 0.33 + R())) + (spike ? 0.34 : 0) * (0.6 + R() * 0.4))
    b.set(spike ? 'crayon' : 'charcoal', spike ? '#e3a622' : i % 3 ? '#4b1f6e' : '#8a3fb4', spike ? 1.6 : 0.9)
    b.line(x, base, x + (R() - 0.5) * 6, base - h)
  }
  layer('Baseline')
  b.set('2B', INK, 0.8); b.line(60, base + 10, W - 60, base + 10)
  layer('Messages')
  b.noStroke(); b.fill('#c44db0', 180)
  for (let i = 0; i < 220; i++) b.circle(70 + R() * (W - 140), H * 0.1 + R() * H * 0.42, 0.8 + R() * 2.6) // messages
}
// </plate:stream>

// <plate:iris>
// Sybol engine: an iris whose line-work loses order as the authenticity score falls from 1 to 0.
export const plateIris: Sketch = (b, W, H) => {
  const R = rng(21)
  const cx = W / 2, cy = H * 0.46
  layer('Iris wash')
  b.noStroke(); b.fill('#2c5f8a', 89); b.fillBleed(0.5); b.circle(cx, cy, 300)
  layer('Fibres, ordered to chaotic')
  const n = 190
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360
    const score = 1 - Math.min(1, Math.max(0, (Math.cos((a * Math.PI) / 180) + 1) / 2)) // right side = low score
    const chaos = (1 - score) * 70
    const r0 = 40 + R() * 16, r1 = 270 + (R() - 0.5) * (30 + chaos * 1.2)
    const jx = (R() - 0.5) * chaos, jy = (R() - 0.5) * chaos
    b.set(score > 0.5 ? 'rotring' : '2B', score > 0.5 ? '#1d4e7a' : '#8c2a1b', 0.4 + (1 - score) * 0.7)
    b.line(cx + Math.cos((a * Math.PI) / 180) * r0, cy + Math.sin((a * Math.PI) / 180) * r0, cx + Math.cos((a * Math.PI) / 180) * r1 + jx, cy + Math.sin((a * Math.PI) / 180) * r1 + jy)
  }
  layer('Pupil')
  b.noStroke(); b.fill('#0b0d12', 242); b.circle(cx, cy, 42)
  layer('Rim')
  b.set('rotring', INK, 0.9); b.noFill(); b.circle(cx, cy, 285)
}
// </plate:iris>

// <plate:hills>
// Frutas Prohibidas: three bands of landscape for the three impacts of a meal: CO2, water, land.
export const plateHills: Sketch = (b, W, H) => {
  const band = (y0: number, amp: number, col: string, seed: number, hatchAngle: number) => {
    const R = rng(seed); const pts: [number, number][] = []
    for (let i = 0; i <= 14; i++) pts.push([(i / 14) * W, y0 - Math.sin(i * 0.7 + seed) * amp - R() * amp * 0.5])
    const shape: [number, number][] = [...pts, [W, H], [0, H]]
    b.noStroke(); b.wash(col, 215)                       // solid colour base
    b.polygon(shape)
    b.fill(col, 140); b.fillBleed(0.4); b.fillTexture(0.7, 0.6) // watercolour bloom on top
    b.polygon(shape)
    b.set('2B', INK, 0.5); b.noFill(); b.noWash(); b.hatch(7, hatchAngle, { rand: 0.15 })
    b.polygon(shape); b.noHatch()
  }
  layer('Sky')
  b.noStroke(); b.fill('#9fc3e6', 150); b.fillBleed(0.6); b.rect(30, 30, W - 60, H * 0.5)
  layer('Sun')
  b.fill('#f5c451', 230); b.circle(W * 0.7, H * 0.2, 62)
  layer('CO2')
  band(H * 0.5, 44, '#e4572e', 4, 35)
  layer('Land')
  band(H * 0.66, 38, '#3f8f4f', 8, -30)
  layer('Water')
  band(H * 0.83, 26, '#2f6fa8', 12, 80)
}
// </plate:hills>

export const PLATES = [
  { id: 'fire', slug: 'los-panaderos', sketch: plateFire },
  { id: 'cost', slug: 'iata-saf-datathon', sketch: plateCost },
  { id: 'chain', slug: 'pharmable', sketch: plateChain },
  { id: 'stream', slug: 'streamscope', sketch: plateStream },
  { id: 'iris', slug: 'sybol-compliance-engine', sketch: plateIris },
  { id: 'hills', slug: 'frutas-prohibidas', sketch: plateHills },
] as const
