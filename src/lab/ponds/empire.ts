import { noise, rng, type PondDef } from './kit'
import { acc, BAYER, ink, MONO, POSE } from './auto'

/**
 * The Course of Empire (after Thomas Cole's five paintings, 1833-36), as one self-running world in the site's voice.
 * The same bay and the same crag with its boulder, seen through a day: a forest grows at dawn, is cleared for huts and
 * a stone circle, a city rises column by column at noon, burns and falls in a storm, and under the moon ivy and trees
 * take the ruins back, around one column left standing. Then the wilderness returns and it starts again.
 *
 * It is a grid of cells with a few rules (growth, building plans, fire that spreads, rubble that falls, ivy that
 * creeps), stepped at the site's 12 poses a second and drawn as ink and dither on a transparent canvas.
 */
const E = 0, GROUND = 1, WATER = 2, TREE = 3, STONE = 4, FIRE = 5, RUIN = 6, IVY = 7, PILLAR = 8
export const STAGES = ['the savage state', 'the arcadian state', 'the consummation of empire', 'destruction', 'desolation']
const NUM = ['i', 'ii', 'iii', 'iv', 'v']
const LEN = 216 // steps per stage
const RATE = 1.5 // steps per pose: 216 / 1.5 / 12 = 12 seconds a stage (one day), a minute a pass, the same for every version
/** A point that moves at constant speed along an arch from x0 to x1, rising A cells: f in [0, 1] gives [x, rise]. */
const arch = (x0: number, x1: number, A: number) => {
  const N = 256, L = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) L[i] = L[i - 1] + Math.hypot((x1 - x0) / N, A * (Math.sin((Math.PI * i) / N) - Math.sin((Math.PI * (i - 1)) / N)))
  return (f: number): [number, number] => {
    const d = Math.max(0, Math.min(1, f)) * L[N]
    let i = 1; while (i < N && L[i] < d) i++
    const p = (i - 1 + (d - L[i - 1]) / (L[i] - L[i - 1] || 1)) / N
    return [x0 + (x1 - x0) * p, Math.sin(Math.PI * p) * A]
  }
}
const h2 = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
const sm = (t: number) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t) }

type Structure = { cells: number[]; type: number; at: number; from: number; rate: number; hut?: boolean; apex?: number }
type Tree = { x: number; h: number; lvl: number; cells: number[] }

const world = (C: number, R: number, seed: number, horizon = 0.72) => {
  const n = C * R, r = rng(seed)
  const grid = new Uint8Array(n), base = new Uint8Array(n), life = new Uint8Array(n), was = new Uint8Array(n)
  const waterRow = Math.floor(R * horizon), bayL = Math.floor(C * 0.38), bayR = Math.floor(C * 0.62), zoneW = Math.floor(C * 0.2)
  const ground = new Int16Array(C)
  for (let x = 0; x < C; x++) {
    const d = x < bayL ? bayL - x : x > bayR ? x - bayR : 0
    ground[x] = d ? Math.round(waterRow - Math.min(3, d * 0.8) - d * 0.035 - noise(x * 0.06, seed % 97) * 3) : waterRow + 3 + Math.round(noise(x * 0.1, 5) * 2)
    for (let y = 0; y < R; y++) base[y * C + x] = y >= ground[x] ? GROUND : y >= waterRow ? WATER : E
  }
  grid.set(base)
  // the far shore: low hills to the left, and to the right the crag with its boulder, the one thing that never changes
  const ridge = new Int16Array(C)
  for (let x = 0; x < C; x++) {
    const cx = C * 0.8, crag = waterRow * 0.5 * Math.max(0, 1 - Math.abs(x - cx) / (C * 0.17)) ** 0.85
    const hills = waterRow * 0.13 * (0.4 + noise(x * 0.035, 9)) * (x < C * 0.55 ? 1 : 0.5)
    ridge[x] = Math.round(waterRow - 1 - Math.max(crag + noise(x * 0.2, 3) * 2, hills) - (Math.abs(x - cx - 1) <= 1 ? 2.5 : 0))
  }
  const trees: Tree[] = []
  let plan: Structure[] = [], s = 0
  const land = (x: number) => x >= 0 && x < C && ground[x] < waterRow
  const inZone = (x: number) => (x >= bayL - zoneW && x < bayL) || (x > bayR && x <= bayR + zoneW)
  const put = (i: number, t: number) => { if (i >= 0 && i < n && grid[i] !== GROUND && grid[i] !== PILLAR) grid[i] = t }

  const sprout = () => {
    const x = Math.floor(r() * C)
    if (!land(x) || grid[(ground[x] - 1) * C + x] !== E || trees.some((t) => Math.abs(t.x - x) < 2) || trees.length > C * 0.55) return
    trees.push({ x, h: 5 + Math.floor(r() * 8), lvl: 0, cells: [] })
  }
  const growTrees = (p: number) => {
    for (const t of trees) {
      if (t.lvl >= t.h || r() > p) continue
      const y = ground[t.x] - 1 - t.lvl, hw = t.lvl < t.h * 0.3 ? 0 : Math.min(3, Math.floor((t.h - t.lvl) / 2.2))
      for (let dx = -hw; dx <= hw; dx++) { const x = t.x + dx, i = y * C + x; if (x >= 0 && x < C && y > 0 && grid[i] === E) { grid[i] = TREE; t.cells.push(i) } }
      t.lvl++
    }
  }
  const fell = (t: Tree) => { for (const i of t.cells) if (grid[i] === TREE) grid[i] = base[i]; trees.splice(trees.indexOf(t), 1) }

  // ---- what gets built, and when (a new plan every cycle)
  const makePlan = () => {
    plan = []
    const rows = (x0: number, wd: number, y: number) => Array.from({ length: wd }, (_, k) => y * C + x0 + k)
    const top = (x0: number, wd: number) => { let t = R; for (let x = x0; x < x0 + wd; x++) t = Math.min(t, ground[x]); return t - 1 }
    const footing = (x0: number, wd: number, y: number) => { const c: number[] = []; for (let x = x0; x < x0 + wd; x++) for (let yy = ground[x] - 1; yy > y; yy--) c.push(yy * C + x); return c }
    for (const side of [0, 1]) {
      const z0 = side ? bayR + 7 : bayL - zoneW, z1 = side ? bayR + zoneW : bayL - 8
      // two huts a side, then the temples that replace them
      for (let k = 0; k < 2; k++) {
        const x0 = z0 + 2 + Math.floor(r() * (z1 - z0 - 8)), y = top(x0, 5)
        plan.push({ type: STONE, at: 0, hut: true, rate: 1, from: LEN + Math.floor(LEN * (0.18 + r() * 0.4)), cells: [...footing(x0, 5, y), ...rows(x0, 5, y), y * C - C + x0, y * C - C + x0 + 4, ...rows(x0, 5, y - 2), ...rows(x0 + 1, 3, y - 3), (y - 4) * C + x0 + 2] })
      }
      for (let x0 = z0; x0 + 7 <= z1;) {
        const wd = Math.min(z1 - x0, 7 + 2 * Math.floor(r() * 4)) | 1, ch = 5 + Math.floor(r() * 7), y = top(x0, wd), cells = [...footing(x0, wd, y), ...rows(x0, wd, y)]
        for (let k = 1; k <= ch; k++) for (let x = x0; x < x0 + wd; x += 2) cells.push((y - k) * C + x)
        cells.push(...rows(x0, wd, y - ch - 1), ...rows(x0, wd, y - ch - 2))
        const ty = y - ch - 3, mid = x0 + (wd >> 1)
        if (r() < 0.6) for (let j = 0; wd - 2 - j * 4 > 0; j++) cells.push(...rows(x0 + 1 + j * 2, wd - 2 - j * 4, ty - j))
        else { const rad = (wd >> 1) - 1; for (let dy = 0; dy <= rad; dy++) { const hw = Math.round(Math.sqrt(rad * rad - dy * dy)); cells.push(...rows(mid - hw, hw * 2 + 1, ty - dy)) } }
        plan.push({ type: STONE, at: 0, rate: 3, from: LEN * 2 + Math.floor(LEN * (0.05 + r() * 0.5)), cells, apex: cells[cells.length - 1] - C })
        x0 += wd + 1 + Math.floor(r() * 2)
      }
    }
    // a stone circle on the left hill
    const cx = bayL - zoneW - 12
    if (cx > 2) { const c: number[] = []; for (let k = 0; k < 4; k++) { const x = cx + k * 3, y = ground[x] - 1; c.push(y * C + x, (y - 1) * C + x, (y - 2) * C + x); if (k % 2) c.push(...rows(x - 3, 4, y - 3)) } plan.push({ type: STONE, at: 0, rate: 1, from: LEN + Math.floor(LEN * 0.55), cells: c }) }
    // the bridge across the bay, pier by pier from the left
    const deck = waterRow - 5, b: number[] = []
    for (let x = bayL - 2; x <= bayR + 2; x++) {
      const k = (x - bayL) % 9
      if (x >= bayL && x <= bayR && (k === 4 || k === 5)) for (let y = Math.min(R - 1, ground[x] - 1); y > deck; y--) b.push(y * C + x)
      else if (k < 2 || k > 7 || x < bayL || x > bayR) b.push((deck + 1) * C + x)
      b.push(deck * C + x); if (x % 2) b.push((deck - 1) * C + x)
    }
    plan.push({ type: STONE, at: 0, rate: 4, from: LEN * 2 + Math.floor(LEN * 0.12), cells: b })
    // a lighthouse on the right point, and on the left the one column that will outlast the rest
    const tx = bayR + 2, ty = ground[tx] - 1, tw: number[] = []
    for (let k = 0; k < 20; k++) tw.push(...rows(tx, 3, ty - k)); tw.push(...rows(tx - 1, 5, ty - 20), ...rows(tx - 1, 5, ty - 21), (ty - 22) * C + tx + 1)
    plan.push({ type: STONE, at: 0, rate: 2, from: LEN * 2 + Math.floor(LEN * 0.3), cells: tw, apex: (ty - 23) * C + tx + 1 })
    const px = bayL - 5, py = ground[px] - 1, pc = [...rows(px - 1, 4, py)]
    for (let k = 1; k <= 13; k++) pc.push(...rows(px, 2, py - k)); pc.push(...rows(px - 1, 4, py - 14))
    plan.push({ type: PILLAR, at: 0, rate: 1, from: LEN * 2 + Math.floor(LEN * 0.45), cells: pc })
  }

  const ignite = (i: number) => { was[i] = grid[i]; grid[i] = FIRE; life[i] = was[i] === STONE ? 10 + Math.floor(r() * 12) : 5 + Math.floor(r() * 8) }
  const burnAndFall = (stage: number) => {
    const spread = stage === 3 ? 1 : 0.12, lit: number[] = []
    for (let i = 0; i < n; i++) {
      if (grid[i] !== FIRE) continue
      for (const j of [i - 1, i + 1, i - C, i + C, i - C - 1, i - C + 1]) {
        if (j < 0 || j >= n) continue
        const t = grid[j], p = t === TREE ? 0.2 : t === STONE ? 0.065 : t === IVY ? 0.2 : 0
        if (p && r() < p * spread) lit.push(j)
      }
      if (--life[i] === 0) grid[i] = was[i] === STONE && r() < 0.55 ? RUIN : base[i]
    }
    for (const j of lit) if (grid[j] !== FIRE) ignite(j)
    const drop = stage === 3 ? 0.09 : 0.004
    for (let y = R - 2; y >= 0; y--) for (let x = 0; x < C; x++) {
      const i = y * C + x, t = grid[i]
      if (t !== RUIN && t !== STONE) continue
      const below = grid[i + C]
      if (t === RUIN) { if (below === E) { grid[i + C] = RUIN; grid[i] = base[i] } else if (below === WATER && r() < 0.5) grid[i] = base[i] }
      else if ((below === E || below === WATER || below === FIRE) && r() < drop) grid[i] = RUIN
    }
  }

  const step = () => {
    const pos = s % (LEN * 5), stage = Math.floor(pos / LEN), k = pos % LEN
    if (pos === 0) makePlan()
    if (stage === 0) {
      // what is left of the last empire wears away, and the forest closes over it
      if (k < LEN * 0.6) for (let i = 0; i < n; i++) { const t = grid[i]; if (t >= STONE && r() < (t === PILLAR ? 0.02 : 0.045)) grid[i] = base[i] }
      for (let j = 0; j < 2; j++) sprout()
      growTrees(0.5)
    } else if (stage === 1) {
      if (k % 3 === 0) { const t = trees.find((tr) => inZone(tr.x)); if (t) fell(t) }
      growTrees(0.2)
    } else if (stage === 2) {
      if (k < 40) for (const b of plan) if (b.hut && b.at) { for (const i of b.cells.splice(0, 2)) if (grid[i] === STONE) grid[i] = base[i] }
      const t = trees.find((tr) => inZone(tr.x)); if (t) fell(t)
    } else if (stage === 3) {
      if (k < LEN * 0.7 && k % 6 === 0) for (let tries = 0; tries < 40; tries++) { const i = Math.floor(r() * n); if (grid[i] === STONE || grid[i] === TREE) { ignite(i); break } }
      burnAndFall(3)
    } else {
      burnAndFall(4)
      for (let j = 0; j < n * 0.012; j++) {
        const i = Math.floor(r() * n)
        if (grid[i] !== E || i < C || i >= n - C) continue
        const near = (t: number) => t === RUIN || t === STONE || t === PILLAR || t === IVY
        if ((near(grid[i - 1]) || near(grid[i + 1]) || near(grid[i + C]) || near(grid[i - C])) && r() < 0.5) grid[i] = IVY
      }
      if (k % 5 === 0) sprout()
      growTrees(0.15)
    }
    for (const b of plan) if (pos >= b.from && b.at < b.cells.length && !(b.hut && stage > 1)) for (let j = 0; j < b.rate && b.at < b.cells.length; j++) put(b.cells[b.at++], b.type)
    s++
  }
  // open on a half-grown forest rather than bare ground
  for (let j = 0; j < 70; j++) { sprout(); sprout(); growTrees(0.5) }
  return { grid, ridge, ground, waterRow, bayL, bayR, step, get s() { return s }, get plan() { return plan } }
}

type Opts = { randomStart?: boolean }
const empireAt = (start: number, o: Opts = {}): PondDef => ({
  id: start ? `empire-${start}` : 'empire', name: start ? `${NUM[start]} · ${STAGES[start]}` : 'The Course of Empire', tags: start ? ['empire', `starts at ${NUM[start]}`] : ['after thomas cole', 'five stages'], bg: '#1a1917', passive: true,
  idea: start ? `The same world, opened at stage ${NUM[start]}. It carries on round the cycle from there.` : 'One bay over five days, one stage a day: a forest, a village, an empire built column by column, its fire and fall, then ivy over the ruins around one last column. Twelve seconds a day, a minute a cycle, then it begins again.',
  hint: 'just watch',
  make(ctx, w, h) {
    const S = Math.max(3, Math.ceil(w / 230)), C = Math.ceil(w / S), R = Math.ceil(h / S), W = world(C, R, 1836, 0.5)
    const first = o.randomStart ? Math.floor(Math.random() * 5) : start
    for (let j = 0; j < first * LEN; j++) W.step()
    // a continuous clock (1.5 steps a pose): the world steps whenever the clock passes a whole step, and the sun reads
    // the clock itself, so it glides every frame instead of jumping
    let clock = first * LEN, tPrev = -1
    // the sun's path: the same arch every day, from below the horizon on the left to below it on the right, so it rises
    // from behind the hills and sets behind the crag
    const SUN_A = W.waterRow * 0.85, SUN_Y0 = W.waterRow + 6, sunArc = arch(C * 0.02, C * 0.98, SUN_A)
    // the sun is light, not a ball: a small solid core that thins into ordered dither, the same 4x4 Bayer pattern as the
    // sky, carried with the sun and placed at its exact (sub-cell) position
    const DISC: [number, number][] = []
    for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) { const d = Math.hypot(i, j), v = d <= 1.6 ? 1 : (1 - (d - 1.6) / 5.4) ** 1.6; if (d <= 7 && v > BAYER[(j & 3) * 4 + (i & 3)]) DISC.push([i, j]) }
    return {
      frame(t) {
        clock += tPrev < 0 ? 0 : (Math.min(0.25, Math.max(0, t - tPrev)) * RATE) / POSE; tPrev = t
        while (W.s < clock) W.step()
        ctx.clearRect(0, 0, w, h)
        const { grid, ridge, waterRow } = W, s = W.s, pos = s % (LEN * 5), stage = Math.floor(pos / LEN), u = (pos % LEN) / LEN, T = stage + u
        // every stage is one day: the same sun on the same arc at the same speed, rising left and setting right, then a
        // short starry night, and the next stage begins at dawn. Five days to build an empire and lose it, then again.
        const day = (clock % LEN) / LEN, D0 = 0.03, D1 = 0.9, sp = (day - D0) / (D1 - D0), sunOn = day > D0 && day < D1
        const [bx, rise] = sunArc(sp), by = SUN_Y0 - rise, up = sunOn ? (waterRow - by) / SUN_A : -1, bodyOn = up > -0.05
        const night = 1 - sm((up + 0.05) / 0.2)
        const lowSun = bodyOn ? 1 - Math.max(0, Math.min(1, up)) : 0, storm = stage === 3 ? sm(u * 5) : stage === 4 ? 1 - sm(u * 4) : 0
        const sky = new Path2D(), mount = new Path2D(), edge = new Path2D(), groundTop = new Path2D(), soil = new Path2D(), water = new Path2D(), glint = new Path2D()
        const treeA = new Path2D(), treeB = new Path2D(), stone = new Path2D(), ruin = new Path2D(), ivy = new Path2D(), fire = new Path2D(), smoke = new Path2D()
        const rad = waterRow * 0.3, open = new Path2D()
        for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
          const i = y * C + x, c = grid[i], px = x * S, py = y * S
          if (c === E) {
            if (y >= ridge[x] && y < waterRow) { if (y === ridge[x]) edge.rect(px, py, S, S); else if ((x * 3 + y * 5) % 7 === 0) mount.rect(px, py, S - 1, S - 1); continue }
            if (y >= waterRow) continue
            open.rect(px, py, S, S)
            let b = (0.07 + lowSun * 0.3) * Math.exp(-(waterRow - y) / (waterRow * 0.2))
            if (bodyOn) { const d2 = (x - bx) ** 2 + (y - by) ** 2; b += (0.55 - storm * 0.4) * Math.exp(-d2 / (2 * rad * rad)) }
            if (storm) b += storm * 0.6 * sm((noise(x * 0.035 + s * 0.012, y * 0.09 + 7) - 0.42) * 4)
            if (b > BAYER[(y & 3) * 4 + (x & 3)] || (night && h2(x, y) < 0.012 * night && h2(x + (s >> 3), y) > 0.25)) sky.rect(px, py, S - 1, S - 1)
            // smoke above anything burning, and rain in the storm
            if (grid[i + C] === FIRE || (y + 2 < R && grid[i + 2 * C] === FIRE && h2(x + s, y) < 0.5)) smoke.rect(px, py, S - 1, S - 1)
            else if (stage === 3 && h2(x + s * 3, y - s * 5) < 0.012 * storm) smoke.rect(px, py, 1, S + 2)
          } else if (c === GROUND) { if (grid[i - C] !== GROUND) groundTop.rect(px, py, S, S); else if ((x + y) % 2 === 0 && (x + y * 3) % 3 === 0) soil.rect(px, py, S - 1, S - 1) }
          else if (c === WATER) {
            const depth = y - waterRow
            if (bodyOn && up > 0 && Math.abs(x - bx) < 1.5 + depth * 0.6 && h2(x + (s >> 1), y) < 0.55 - storm * 0.3) glint.rect(px, py, S, Math.max(1, S - 2))
            else if ((x + y * 3 + (s >> 2)) % 5 === 0) water.rect(px, py, S, 1)
          } else if (c === TREE) ((x + y) % 2 ? treeB : treeA).rect(px, py, S - 1, S - 1)
          else if (c === STONE || c === PILLAR) stone.rect(px, py, S, S)
          else if (c === RUIN) ruin.rect(px, py, S - 1, S - 1)
          else if (c === IVY) { if ((x + y) % 2 === 0) ivy.rect(px, py, S - 1, S - 1) }
          else if (c === FIRE && h2(i, s) < 0.85) fire.rect(px, py, S, S)
        }
        // hearth smoke from the huts, banners on what is finished, ships while there is a city to sail to
        for (const b of W.plan) {
          if (b.hut && stage === 1 && b.at > 12) { const i0 = b.cells[b.cells.length - 1], x0 = i0 % C, y0 = Math.floor(i0 / C); for (let k = 1; k < 9; k++) if (h2(x0 + k, s >> 2) < 0.7) smoke.rect((x0 + Math.round(Math.sin((s + k * 4) * 0.12) * k * 0.3)) * S, (y0 - k) * S, S - 1, S - 1) }
          if (b.apex && stage === 2 && b.at >= b.cells.length) fire.rect(((b.apex % C) + ((s >> 2) % 2)) * S, Math.floor(b.apex / C) * S, S, S)
        }
        if (T > 1.6 && T < 3.5) for (let k = 0; k < 3; k++) {
          if (stage === 3 && u > 0.15 + k * 0.12) continue
          const span = W.bayR - W.bayL - 8, ph = (s * (0.05 + k * 0.02) + k * 37) % (span * 2), x = Math.round(W.bayL + 3 + (ph < span ? ph : span * 2 - ph)), y = waterRow - 1
          const p = stage === 3 ? fire : stone
          p.rect((x - 1) * S, y * S, S * 4, S); p.rect(x * S, (y - 4) * S, S, S * 4); p.rect((x + 1) * S, (y - 3) * S, S, S * 2)
        }
        ctx.fillStyle = ink(0.26); ctx.fill(sky)
        // the sun, drawn only over open sky: hills, the crag, trees, buildings and smoke all pass in front of it
        if (bodyOn) {
          const disc = new Path2D()
          for (const [i, j] of DISC) disc.rect((bx + i - 0.5) * S, (by + j - 0.5) * S, S - 1, S - 1)
          ctx.save(); ctx.clip(open); ctx.fillStyle = ink(0.85); ctx.fill(disc); ctx.restore()
        }
        ctx.fillStyle = ink(0.1); ctx.fill(mount); ctx.fillStyle = ink(0.34); ctx.fill(edge)
        ctx.fillStyle = ink(0.2); ctx.fill(smoke)
        ctx.fillStyle = ink(0.2); ctx.fill(water); ctx.fillStyle = ink(0.6); ctx.fill(glint)
        ctx.fillStyle = ink(0.5); ctx.fill(groundTop); ctx.fillStyle = ink(0.13); ctx.fill(soil)
        ctx.fillStyle = ink(0.5); ctx.fill(treeA); ctx.fillStyle = ink(0.22); ctx.fill(treeB)
        ctx.fillStyle = ink(0.45); ctx.fill(ivy); ctx.fillStyle = ink(0.36); ctx.fill(ruin)
        ctx.fillStyle = ink(0.92); ctx.fill(stone)
        ctx.fillStyle = acc(); ctx.fill(fire)
        // lightning, now and then, while it burns
        if (stage === 3 && h2(s, 7) < 0.035) {
          let x = (0.15 + h2(s, 1) * 0.7) * w, y = 0
          ctx.strokeStyle = ink(0.95); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y)
          while (y < waterRow * S * 0.8) { x += (h2(x | 0, y | 0) - 0.5) * 26; y += 6 + h2(y | 0, s) * 12; ctx.lineTo(x, y) }
          ctx.stroke()
        }
        ctx.clearRect(4, 4, 250, 18)
        ctx.font = `10px ${MONO}`; ctx.textBaseline = 'top'; ctx.fillStyle = ink(0.45)
        ctx.fillText(`${'■'.repeat(stage + 1)}${'□'.repeat(4 - stage)}  ${NUM[stage]} · ${STAGES[stage]}`, 10, 8)
      },
    }
  },
})

export const empire = empireAt(0)
/** The playground's version: a day per stage, the horizon at mid-height so the home text sits over water and land. */
export const empireDays: PondDef = {
  ...empireAt(0, { randomStart: true }), id: 'empire-days', name: 'A day per stage',
  tags: ['empire', 'playground'], idea: 'The same world, but each stage is one day: sunrise, sunset, a short night, and the next stage at dawn. Opens on a random stage.',
}
export const EMPIRE_PONDS: PondDef[] = [empireDays, empire, ...[1, 2, 3, 4].map((k) => empireAt(k))]
