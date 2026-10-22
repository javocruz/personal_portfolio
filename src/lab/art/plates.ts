import { rng, layer, type Sketch } from './paint'

/**
 * Each plate is a short sketch painted with p5.brush from a real number in the project it illustrates.
 * The markers let the Plates page show the exact source ("view source"). Each layer() call starts a step of the
 * recipe; the site shows the painting as it stood after every step.
 */
const INK = '#17110c'

// <plate:frost>
// SnapFrost: 358 unseen nights, and the forecast error shrinking from 1.50 °C (ECMWF) to 1.29 °C (ours): two rings of frost.
export const plateFrost: Sketch = (b, W, H) => {
  const R = rng(31)
  const cx = W / 2, cy = H * 0.3, k = 150 // px per °C of error
  layer('Night sky')
  b.noStroke(); b.fillBleed(0.4); b.fillTexture(0.6, 0.5)
  for (let i = 0; i < 4; i++) { b.fill(i < 2 ? '#0e1a44' : '#1b2b5a', 230); b.rect(36, 36, W - 72, H * 0.6) } // washes stack into a night
  layer('358 nights')
  b.set('pen', '#ffffff', 1.3)
  for (let i = 0; i < 358; i++) { // one small cross per night
    const x = 56 + R() * (W - 112), y = 56 + R() * H * 0.54, r = 1.5 + R() * 2.5
    b.line(x - r, y, x + r, y); b.line(x, y - r, x, y + r)
  }
  layer('Forecast error, 1.50 °C')
  b.noFill(); b.set('2B', '#9fb6d8', 1.3)
  for (let j = 0; j < 4; j++) b.circle(cx + (R() - 0.5) * 6, cy + (R() - 0.5) * 6, 1.5 * k + j * 3)
  layer('Ours, 1.29 °C')
  b.set('rotring', '#ffffff', 1.8)
  for (let j = 0; j < 3; j++) b.circle(cx + (R() - 0.5) * 2, cy + (R() - 0.5) * 2, 1.29 * k + j * 2)
  b.noStroke(); b.fill('#f4f1e6', 255); b.circle(cx, cy, 26) // the moon on a clear, calm night
  layer('Potato rows')
  b.noStroke(); b.fillBleed(0.3)
  for (let i = 0; i < 2; i++) { b.fill('#4a3222', 220); b.rect(0, H * 0.64, W, H * 0.36) }
  const rowY = (r: number) => H * (0.69 + r * 0.055)
  for (let r = 0; r < 6; r++) {
    b.set('charcoal', '#120c08', 0.9)
    b.spline(Array.from({ length: 9 }, (_, i) => [i * (W / 8), rowY(r) + Math.sin(i * 1.3 + r) * 4] as [number, number]), 0.8)
    b.set('2B', '#2f6b3a', 1.6)
    for (let i = 0; i < 22; i++) { // leaves along the row
      const x = 24 + i * ((W - 48) / 21) + (R() - 0.5) * 8, y = rowY(r) - 4
      b.line(x, y, x - 8 - R() * 8, y - 12 - R() * 10); b.line(x, y, x + 8 + R() * 8, y - 12 - R() * 10); b.line(x, y, x + (R() - 0.5) * 4, y - 16 - R() * 8)
    }
  }
  layer('Frost on the leaves')
  b.set('pen', '#ffffff', 1.3)
  for (let i = 0; i < 160; i++) { // six-armed crystals where the air at the leaves is colder than at 2 m
    const x = 20 + R() * (W - 40), y = rowY((R() * 6) | 0) - 8 - R() * 16, r = 4 + R() * 5
    for (let a = 0; a < 3; a++) { const t = (a * 60 * Math.PI) / 180; b.line(x - Math.cos(t) * r, y - Math.sin(t) * r, x + Math.cos(t) * r, y + Math.sin(t) * r) }
  }
}
// </plate:frost>

// <plate:maps>
// Los Panaderos: one wildfire, two maps. Above, the truth; below, what the control room knows, 12 steps behind.
export const plateMaps: Sketch = (b, W, H) => {
  const R = rng(17)
  const C = 36, Rw = 20, cell = (W - 120) / C, T = 30, LAG = 12
  // grow the fire on a grid; wind from the west pushes it east
  const burn: number[] = new Array(C * Rw).fill(-1)
  burn[10 * C + 5] = 0
  for (let t = 1; t <= T; t++) for (let i = 0; i < C * Rw; i++) {
    if (burn[i] >= 0) continue
    const x = i % C, y = (i / C) | 0
    let p = 0
    for (const [dx, dy, w] of [[-1, 0, 0.34], [1, 0, 0.05], [0, -1, 0.13], [0, 1, 0.13]] as const) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && nx < C && ny >= 0 && ny < Rw && burn[ny * C + nx] >= 0 && burn[ny * C + nx] < t) p += w
    }
    if (R() < p) burn[i] = t
  }
  const top = H * 0.07, bot = H * 0.53, mh = Rw * cell
  const at = (y0: number, i: number) => [60 + (i % C) * cell, y0 + ((i / C) | 0) * cell] as const
  layer('Two maps of Brunete')
  for (const y0 of [top, bot]) {
    b.noStroke(); b.fill('#a9b688', 200); b.fillBleed(0.25); b.rect(60, y0, W - 120, mh)
    b.set('HB', '#3d3c30', 0.6)
    for (let i = 0; i <= C; i += 4) b.line(60 + i * cell, y0, 60 + i * cell, y0 + mh)
    for (let j = 0; j <= Rw; j += 4) b.line(60, y0 + j * cell, W - 60, y0 + j * cell)
  }
  const paintFire = (y0: number, upTo: number) => {
    b.noStroke()
    for (let i = 0; i < C * Rw; i++) {
      const t = burn[i]
      if (t < 0 || t > upTo) continue
      const age = upTo - t
      b.fill(age < 3 ? '#f5b631' : age < 9 ? '#e2481e' : age < 18 ? '#9c2412' : '#2a0b07', 250)
      const [x, y] = at(y0, i); b.rect(x + 1, y + 1, cell - 2, cell - 2)
    }
  }
  layer('The real fire')
  paintFire(top, T)
  layer('What the control room knows, 12 steps behind')
  paintFire(bot, T - LAG)
  b.set('HB', INK, 0.5); b.noFill()
  b.hatch(5, 45, { rand: 0.2 }); b.rect(60, bot, W - 120, mh); b.noHatch() // everything below is a delayed guess
  layer('Sensors and smoke calls')
  b.set('rotring', INK, 0.9)
  for (let i = 0; i < 14; i++) { const x = 70 + R() * (W - 140), y = bot + 10 + R() * (mh - 20); b.circle(x, y, 6); b.line(x - 10, y, x + 10, y); b.line(x, y - 10, x, y + 10) }
  layer('Drones and trucks')
  for (let i = 0; i < 9; i++) {
    const front = burn.findIndex((t, j) => t === T - LAG - (i % 4) && j % C > 3 + i)
    if (front < 0) continue
    const [x, y] = at(bot, front)
    b.set('rotring', i < 6 ? '#1d4e7a' : '#14100d', 1.6)
    if (i < 6) { b.line(x - 10, y + 7, x, y - 10); b.line(x, y - 10, x + 10, y + 7); b.line(x + 10, y + 7, x - 10, y + 7) } // drone
    else { b.noStroke(); b.fill('#14100d', 255); b.rect(x - 11, y - 6, 22, 12) } // truck
  }
}
// </plate:maps>

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

// seed: fixed per plate, so adding or reordering plates never changes an existing painting
export const PLATES = [
  { id: 'frost', slug: 'snapfrost', sketch: plateFrost, seed: 7 },
  { id: 'maps', slug: 'los-panaderos', sketch: plateMaps, seed: 8 },
  { id: 'iris', slug: 'sybol-compliance-engine', sketch: plateIris, seed: 5 },
  { id: 'chain', slug: 'pharmable', sketch: plateChain, seed: 3 },
  { id: 'hills', slug: 'frutas-prohibidas', sketch: plateHills, seed: 6 },
] as const
