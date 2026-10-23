import { rng, layer, type B, type Sketch } from './paint'

/**
 * Core, Mondrian style: the same five projects, drawn like De Stijl. The canvas is split by the project's numbers,
 * a few planes get flat red, blue or yellow, and thick black lines hold it together. Same rules as plates.ts:
 * seeded, one layer() per recipe step, baked to JPG.
 */
const WHITE = '#f4f1e8', RED = '#d4271b', BLUE = '#1d3c8f', YELLOW = '#f2c40c', BLACK = '#111111'
type P = [number, number]

/** A flat plane of paint: an opaque coat, then a thin textured one on top so it reads as paint, not vector. */
function plane(b: B, pts: P[], col: string) {
  b.noStroke(); b.noFill()
  b.wash(col, 255); b.polygon(pts); b.noWash()
  b.fill(col, 60); b.fillBleed(0); b.fillTexture(0.08, 0, false); b.polygon(pts); b.noFill()
}
const box = (x: number, y: number, w: number, h: number): P[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
/** A thick black line: a solid bar (exact width), then pen strokes along it for a brushed edge. */
function bar(b: B, x1: number, y1: number, x2: number, y2: number, w: number) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = (-dy / len) * (w / 2), ny = (dx / len) * (w / 2)
  b.noStroke(); b.wash(BLACK, 255); b.polygon([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]); b.noWash()
  b.set('pen', BLACK, 1.4)
  for (const k of [-0.42, 0.42]) b.line(x1 + nx * k * 2, y1 + ny * k * 2, x2 + nx * k * 2, y2 + ny * k * 2)
}
/** Pencil guides where the lines will go, the way the grid was laid out before painting. */
function guide(b: B, x1: number, y1: number, x2: number, y2: number) { b.set('HB', '#b3ad9f', 0.4); b.line(x1, y1, x2, y2) }
const ground = (b: B, W: number, H: number) => { b.noStroke(); b.wash(WHITE, 255); b.rect(0, 0, W, H); b.noWash(); b.fill('#ebe6d8', 60); b.fillTexture(0.5, 0.1); b.rect(0, 0, W, H); b.noFill() }

// <plate:frost>
// SnapFrost: the blue plane is 1.29/1.50 of the width (our error vs ECMWF's); the yellow strip is the 0.21 °C gained;
// 358 ticks along the bottom rule, one per unseen night.
export const mondrianFrost: Sketch = (b, W, H) => {
  const ours = 1.29, ecmwf = 1.5, nights = 358
  const x0 = W * (ours / ecmwf) // where our error ends and the gain begins
  const y1 = H * 0.24, y2 = H * 0.66, y3 = H * 0.8, t = 14
  layer('Ground')
  ground(b, W, H)
  layer('Grid')
  for (const y of [y1, y2, y3]) guide(b, 0, y, W, y)
  guide(b, x0, 0, x0, y2); guide(b, W * 0.3, 0, W * 0.3, y1); guide(b, W * 0.58, y3, W * 0.58, H)
  layer('Colour planes')
  plane(b, box(0, y1, x0, y2 - y1), BLUE)          // ours: 1.29 °C of error
  plane(b, box(x0, y1, W - x0, y2 - y1), YELLOW)   // the 0.21 °C we took off
  plane(b, box(W * 0.58, y3, W * 0.42, H - y3), RED)
  layer('Black lines')
  bar(b, 0, y1, W, y1, t); bar(b, 0, y2, W, y2, t + 2); bar(b, 0, y3, W * 0.9, y3, t - 2) // the last one stops short
  bar(b, x0, 0, x0, y2, t - 4)
  bar(b, W * 0.3, 0, W * 0.3, y1, t); bar(b, W * 0.58, y3, W * 0.58, H, t)
  layer('358 nights')
  b.set('pen', BLACK, 1.4)
  const per = Math.ceil(nights / 3), gap = (W - 48) / per
  for (let i = 0; i < nights; i++) { // three rows of ticks hanging from the rule; every 7th, a week, is longer
    const r = (i / per) | 0, x = 24 + (i % per) * gap, y = y2 + t / 2 + 12 + r * 26
    b.line(x, y, x, y + (i % 7 === 6 ? 16 : 10))
  }
}
// </plate:frost>

// <plate:maps>
// Los Panaderos: one subdivision, two grids. Above, the fire now; below, the same fire 12 steps earlier, which is
// what the control room knows. The lag reads as missing colour. Yellow burns now, red is burning, blue is burnt out.
export const mondrianMaps: Sketch = (b, W, H) => {
  const R = rng(17)
  const T = 30, LAG = 12
  // uneven columns and rows, shared by both grids
  const cols = [0.16, 0.09, 0.22, 0.13, 0.19, 0.08, 0.13], rows = [0.3, 0.18, 0.34, 0.18]
  const xs = [0], ys = [0]
  for (const c of cols) xs.push(xs[xs.length - 1] + c * W)
  for (const r of rows) ys.push(ys[ys.length - 1] + r)
  // when each cell catches: ignition in the west, the wind pushes it east (3 steps a column, 6 a row) plus some luck
  const burn = cols.map((_, i) => rows.map((_, j) => 2 + i * 3 + Math.abs(j - 1) * 6 + ((R() * 5) | 0)))
  const top = 0, bot = H * 0.53, gh = H * 0.47, t = 12
  const cell = (y0: number, i: number, j: number, inset = 0): P[] => box(xs[i] + inset, y0 + ys[j] * gh + inset, xs[i + 1] - xs[i] - inset * 2, (ys[j + 1] - ys[j]) * gh - inset * 2)
  const paintFire = (y0: number, now: number, inset: number) => {
    cols.forEach((_, i) => rows.forEach((_, j) => {
      const age = now - burn[i][j]
      if (age < 0) return
      plane(b, cell(y0, i, j, inset), age < 6 ? YELLOW : age < 20 ? RED : BLUE)
    }))
  }
  layer('Ground')
  ground(b, W, H)
  layer('Grid')
  for (const y0 of [top, bot]) {
    for (const x of xs.slice(1, -1)) guide(b, x, y0, x, y0 + gh)
    for (const y of ys.slice(1, -1)) guide(b, 0, y0 + y * gh, W, y0 + y * gh)
  }
  layer('Colour planes')
  paintFire(top, T, 0) // the fire now
  layer('Black lines')
  for (const y0 of [top, bot]) {
    xs.slice(1, -1).forEach((x, k) => bar(b, x, y0, x, y0 + gh - (k === 4 ? gh * 0.3 : 0), t)) // one stops short
    ys.slice(1, -1).forEach((y) => bar(b, 0, y0 + y * gh, W, y0 + y * gh, t))
  }
  bar(b, 0, bot - (bot - gh) / 2, W, bot - (bot - gh) / 2, 30) // the wall between the truth and the guess
  layer('What the control room knows, 12 steps behind')
  paintFire(bot, T - LAG, t / 2)
}
// </plate:maps>

// <plate:iris>
// Sybol engine: authenticity 1.0 on the left, 0.0 on the right. Where the score falls, the grid loses order: lines
// lean and shift, cells stop lining up, and the primaries drift off true.
export const mondrianIris: Sketch = (b, W, H) => {
  const R = rng(21)
  const n = 6, cw = W / n
  const score = (i: number) => 1 - i / (n - 1)
  const mix = (a: string, c: string, k: number) => '#' + [1, 3, 5].map((o) => Math.round(parseInt(a.slice(o, o + 2), 16) * (1 - k) + parseInt(c.slice(o, o + 2), 16) * k).toString(16).padStart(2, '0')).join('')
  // each column's rows, shifted further from the true grid as the score drops
  const rowsOf = (i: number) => [0.22, 0.47, 0.71].map((y) => (y + (1 - score(i)) * (R() - 0.5) * 0.24) * H)
  const lean = (i: number) => (1 - score(i)) * (R() - 0.5) * 70 // how far a column's right edge leans
  const cols = Array.from({ length: n }, (_, i) => ({ x0: i * cw, x1: (i + 1) * cw, lean: i === n - 1 ? 0 : lean(i), rows: rowsOf(i) }))
  const palette = [RED, BLUE, YELLOW]
  layer('Ground')
  ground(b, W, H)
  layer('Grid')
  for (const c of cols) { guide(b, c.x1, 0, c.x1 + c.lean, H); for (const y of c.rows) guide(b, c.x0, y, c.x1, y) }
  layer('Colour planes')
  cols.forEach((c, i) => {
    const prev = cols[i - 1]?.lean ?? 0, ys = [0, ...c.rows, H]
    for (let j = 0; j < 4; j++) {
      if ((i * 5 + j * 3) % 4) continue // about one cell in four takes colour
      const y0 = ys[j], y1 = ys[j + 1], k = (y: number) => y / H
      const drift = (1 - score(i)) * 0.55
      plane(b, [[c.x0 + prev * k(y0), y0], [c.x1 + c.lean * k(y0), y0], [c.x1 + c.lean * k(y1), y1], [c.x0 + prev * k(y1), y1]],
        mix(palette[(i + j) % 3], ['#7a6a55', '#5d7b6f', '#b98a6b'][(i + j) % 3], drift))
    }
  })
  layer('Black lines')
  cols.forEach((c, i) => {
    const s = score(i), w = 9 + s * 6
    if (i < n - 1) bar(b, c.x1, 0, c.x1 + c.lean, H - (s < 0.4 ? H * 0.12 : 0), w)
    for (const y of c.rows) bar(b, c.x0 + (s < 0.5 ? 10 : 0), y, c.x1 - (s < 0.3 ? 22 : 0), y + (1 - s) * (R() - 0.5) * 30, w)
  })
}
// </plate:iris>

// <plate:chain>
// Pharmable: 7 blocks, each sealed into the next by one continuous black line, the way SHA-256 chains them.
// Block 5 carries the critical finding and is solid red.
export const mondrianChain: Sketch = (b, W, H) => {
  const R = rng(9)
  const n = 7, critical = 4, bh = H * 0.1, gap = (H - n * bh) / (n + 1), t = 11
  const x = (i: number) => (i % 2 ? W * 0.12 : W * 0.34), bw = W * 0.54
  const y = (i: number) => gap + i * (bh + gap)
  const fills = [WHITE, BLUE, WHITE, YELLOW, RED, WHITE, BLUE]
  layer('Ground')
  ground(b, W, H)
  layer('Grid')
  for (let i = 0; i < n; i++) { guide(b, 0, y(i), W, y(i)); guide(b, 0, y(i) + bh, W, y(i) + bh) }
  layer('Colour planes')
  for (let i = 0; i < n; i++) if (fills[i] !== WHITE) plane(b, box(x(i), y(i), bw, bh), fills[i])
  layer('Black lines')
  for (let i = 0; i < n; i++) {
    const x0 = x(i), x1 = x0 + bw, y0 = y(i), y1 = y0 + bh
    bar(b, x0, y0, x1, y0, t); bar(b, x0, y1, x1, y1, t)
    bar(b, x0, y0 - t / 2, x0, y1 + t / 2, t); bar(b, x1, y0 - t / 2, x1, y1 + t / 2, t)
    if (i < n - 1) { // the link: an edge of this block runs on into the next one
      const lx = i % 2 ? x1 - bw * 0.22 : x0 + bw * 0.22
      bar(b, lx, y1, lx, y(i + 1), t)
    }
  }
  bar(b, W * 0.06, 0, W * 0.06, y(0) + bh * 0.6, t) // the chain starts off the canvas
  layer('Hash nibbles')
  for (let i = 0; i < n; i++) for (let k = 0; k < 8; k++) { // the first bytes of each block's hash, as small squares
    if (R() < 0.35) continue
    const s = 7; plane(b, box(x(i) + 22 + k * 15, y(i) + bh / 2 - s / 2, s, s), i === critical ? WHITE : BLACK)
  }
}
// </plate:chain>

// <plate:hills>
// Frutas Prohibidas: one meal's three impacts as three planes, each sized by its share. Red is CO₂, yellow is land,
// blue is water.
export const mondrianHills: Sketch = (b, W, H) => {
  // TODO(javi): confirm value. No impact figures in the code; these shares are the band heights of the original
  // plate (0.16, 0.17, 0.17 of the canvas).
  const share = { co2: 0.16 / 0.5, land: 0.17 / 0.5, water: 0.17 / 0.5 }
  const A = W * H * 0.58 // the three planes together cover 58% of the canvas
  const blueH = (A * share.water) / W, by = H - blueH // water: the band along the bottom
  // CO₂ top left (v × h1) and land on the right below it ((W − v) × (by − h1)): find the split that gives both areas
  let v = W / 2, best = Infinity
  for (let c = W * 0.35; c < W * 0.85; c++) {
    const h1 = (A * share.co2) / c, err = Math.abs((W - c) * (by - h1) - A * share.land)
    if (h1 < by && err < best) { best = err; v = c }
  }
  const h1 = (A * share.co2) / v, t = 14
  layer('Ground')
  ground(b, W, H)
  layer('Grid')
  guide(b, v, 0, v, by); guide(b, 0, h1, W, h1); guide(b, 0, by, W, by); guide(b, v + (W - v) * 0.55, 0, v + (W - v) * 0.55, h1); guide(b, 0, h1 + (by - h1) * 0.6, v, h1 + (by - h1) * 0.6)
  layer('Colour planes')
  plane(b, box(0, 0, v, h1), RED)               // CO₂
  plane(b, box(v, h1, W - v, by - h1), YELLOW)  // land
  plane(b, box(0, by, W, blueH), BLUE)          // water
  layer('Black lines')
  bar(b, v, 0, v, by, t); bar(b, 0, h1, W, h1, t); bar(b, 0, by, W, by, t + 2)
  bar(b, v + (W - v) * 0.55, 0, v + (W - v) * 0.55, h1, t)
  bar(b, 0, h1 + (by - h1) * 0.6, v * 0.8, h1 + (by - h1) * 0.6, t) // stops before it reaches the land
}
// </plate:hills>

// seed: fixed per plate, so adding or reordering plates never changes an existing painting
export const PLATES_MONDRIAN = [
  { id: 'frost', slug: 'snapfrost', sketch: mondrianFrost, seed: 7 },
  { id: 'maps', slug: 'los-panaderos', sketch: mondrianMaps, seed: 8 },
  { id: 'iris', slug: 'sybol-compliance-engine', sketch: mondrianIris, seed: 5 },
  { id: 'chain', slug: 'pharmable', sketch: mondrianChain, seed: 3 },
  { id: 'hills', slug: 'frutas-prohibidas', sketch: mondrianHills, seed: 6 },
] as const
