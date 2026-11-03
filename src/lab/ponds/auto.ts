import { pick, rng, type PondDef } from './kit'

/**
 * Ponds that run themselves: cellular automata and small simulations in the site's voice, stepping at the site's own
 * pace of 12 poses a second. The cursor does nothing; something interesting just keeps happening.
 *
 * They draw ink (and the odd accent) on a transparent canvas, so the page's own background shows through and the
 * same code serves the dark and the light theme: setPalette() before make().
 */
let INK = [255, 247, 240], ACC = [224, 122, 63]
export const setPalette = (ink: number[], acc: number[]) => { INK = ink; ACC = acc }
const ink = (a: number) => `rgba(${INK[0]},${INK[1]},${INK[2]},${a})`
const acc = (a = 1) => `rgba(${ACC[0]},${ACC[1]},${ACC[2]},${a})`
const MONO = "'Geist Mono', ui-monospace, monospace"
const POSE = 1 / 12
// a fresh start on every load: each pond's seed is offset by this
const LOAD = (Math.random() * 2 ** 31) | 0
const fresh = (n: number) => rng(LOAD + n)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const clear = (ctx: CanvasRenderingContext2D, w: number, h: number) => ctx.clearRect(0, 0, w, h)
const label = (ctx: CanvasRenderingContext2D, text: string) => { ctx.font = `10px ${MONO}`; ctx.textBaseline = 'top'; ctx.fillStyle = ink(0.4); ctx.fillText(text, 10, 8) }

/** A low-res pixel buffer (transparent where nothing is drawn), drawn back up without smoothing. */
const pixels = (bw: number, bh: number) => {
  const c = document.createElement('canvas'); c.width = bw; c.height = bh
  const x = c.getContext('2d')!, img = x.createImageData(bw, bh), d = img.data
  return {
    /** colour i with `rgb` at opacity a (0..1); a = 0 leaves it clear */
    set(i: number, rgb: number[], a = 1) { const o = i * 4; d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = a * 255 },
    blit(ctx: CanvasRenderingContext2D, S: number) { x.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, bw * S, bh * S); ctx.imageSmoothingEnabled = true },
  }
}
/** Calls fn once per `dt` of time (catching up at most a second, e.g. after the tab was hidden); returns whether it did. */
const every = (dt: number, fn: () => void) => {
  let last = -1
  return (t: number) => {
    if (last < 0) last = t
    if (t - last > 1) last = t - dt
    let ran = false
    while (t - last >= dt) { last += dt; fn(); ran = true }
    return ran
  }
}

/* Conway's Life on a torus, with seeds when the board goes quiet; their descendants glow for a while */
const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]], RPENT = [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], ACORN = [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]]
const lifeEngine = (C: number, R: number, seed: number) => {
  const r = fresh(seed), n = C * R
  let a = new Uint8Array(n), b = new Uint8Array(n)
  let heat = new Float32Array(n), heat2 = new Float32Array(n)
  const trail = new Float32Array(n), hist: number[] = []
  for (let i = 0; i < n; i++) a[i] = r() < 0.2 ? 1 : 0
  let gen = 0
  const drop = () => {
    const s = pick(r, [RPENT, ACORN, GLIDER, RPENT]), cx = Math.floor(r() * C), cy = Math.floor(r() * R)
    for (const [dx, dy] of s) { const i = ((cy + dy) % R) * C + ((cx + dx) % C); a[i] = 1; heat[i] = 1 }
  }
  return {
    get a() { return a }, get heat() { return heat }, trail,
    step() {
      let pop = 0
      for (let y = 0; y < R; y++) {
        const up = ((y + R - 1) % R) * C, mid = y * C, dn = ((y + 1) % R) * C
        for (let x = 0; x < C; x++) {
          const l = (x + C - 1) % C, rr = (x + 1) % C
          const nb = a[up + l] + a[up + x] + a[up + rr] + a[mid + l] + a[mid + rr] + a[dn + l] + a[dn + x] + a[dn + rr]
          const i = mid + x, alive = a[i], v = nb === 3 || (alive && nb === 2) ? 1 : 0
          b[i] = v; pop += v
          trail[i] = alive && !v ? 1 : trail[i] * 0.8
          heat2[i] = v ? (alive ? heat[i] * 0.97 : Math.max(heat[up + l], heat[up + x], heat[up + rr], heat[mid + l], heat[mid + rr], heat[dn + l], heat[dn + x], heat[dn + rr]) * 0.94) : 0
        }
      }
      ;[a, b] = [b, a]; [heat, heat2] = [heat2, heat]; gen++
      hist.push(pop); if (hist.length > 36) hist.shift()
      const flat = hist.length === 36 && Math.max(...hist) - Math.min(...hist) < 8
      if (flat || pop < n * 0.04 || gen % 240 === 0) { drop(); hist.length = 0 }
    },
  }
}

const life: PondDef = {
  id: 'life', name: 'Game of Life', tags: ['automata', 'conway'], bg: '#1a1917', passive: true,
  idea: 'Conway’s rules at twelve steps a second. Dead cells leave a fading trace; when the board goes quiet a new seed lands, and its children glow.', hint: 'just watch',
  make(ctx, w, h) {
    const S = 5, C = Math.floor(w / S), R = Math.floor(h / S), L = lifeEngine(C, R, 21), tick = every(POSE, L.step)
    let drawn = false
    return {
      frame(t) {
        if (!tick(t) && drawn) return
        drawn = true; clear(ctx, w, h)
        const on = new Path2D(), hot = new Path2D(), tr = new Path2D()
        for (let i = 0; i < C * R; i++) {
          const x = (i % C) * S, y = Math.floor(i / C) * S
          if (L.a[i]) (L.heat[i] > 0.25 ? hot : on).rect(x, y, S - 1, S - 1)
          else if (L.trail[i] > 0.15) tr.rect(x + 1, y + 1, S - 3, S - 3)
        }
        ctx.fillStyle = ink(0.12); ctx.fill(tr); ctx.fillStyle = ink(0.82); ctx.fill(on); ctx.fillStyle = acc(); ctx.fill(hot)
      },
    }
  },
}

/* elementary automata: one row at a time, scrolling up; the rule changes every few seconds */
const RULES = [110, 30, 90, 54, 150, 73, 45, 105, 18]
const wolfram: PondDef = {
  id: 'wolfram', name: 'Elementary automata', tags: ['automata', 'wolfram'], bg: '#1a1917', passive: true,
  idea: 'One row of cells at a time, each decided by its three neighbours above. Every few seconds the rule changes, and the pattern turns.', hint: 'just watch',
  make(ctx, w, h) {
    const S = 4, C = Math.floor(w / S), R = Math.ceil(h / S), r = fresh(110)
    const rows: { cells: Uint8Array; change: boolean }[] = []
    let rule = Math.floor(r() * RULES.length), count = 0, drawn = false
    const first = new Uint8Array(C); for (let i = 0; i < C; i++) first[i] = r() < 0.5 ? 1 : 0
    rows.push({ cells: first, change: false })
    const step = () => {
      const prev = rows[rows.length - 1].cells, next = new Uint8Array(C), R0 = RULES[rule]
      for (let x = 0; x < C; x++) next[x] = (R0 >> ((prev[(x + C - 1) % C] << 2) | (prev[x] << 1) | prev[(x + 1) % C])) & 1
      count++
      let change = false
      if (count % 80 === 0) { rule = (rule + 1) % RULES.length; change = true; for (let k = 0; k < 6; k++) next[Math.floor(r() * C)] ^= 1 }
      rows.push({ cells: next, change }); if (rows.length > R) rows.shift()
    }
    for (let i = 0; i < R; i++) step()
    const tick = every(POSE, step)
    return {
      frame(t) {
        if (!tick(t) && drawn) return
        drawn = true; clear(ctx, w, h)
        const p = new Path2D(), hp = new Path2D(), off = h - rows.length * S
        rows.forEach((row, j) => { for (let x = 0; x < C; x++) if (row.cells[x]) (row.change ? hp : p).rect(x * S, off + j * S, S - 1, S - 1) })
        ctx.fillStyle = ink(0.72); ctx.fill(p); ctx.fillStyle = acc(); ctx.fill(hp)
        ctx.clearRect(4, 4, 110, 18); label(ctx, `rule ${RULES[rule]}  gen ${count}`)
      },
    }
  },
}

/* reaction-diffusion (Gray-Scott): two chemicals that make coral and spots, dithered in two tones */
const turing: PondDef = {
  id: 'turing', name: 'Reaction-diffusion', tags: ['simulation', 'turing patterns'], bg: '#1a1917', passive: true,
  idea: 'Two chemicals feeding and eating each other (Gray-Scott), growing coral like the patterns on shells and fish. A drop lands now and then.', hint: 'just watch',
  make(ctx, w, h) {
    // keep the simulation to about 40k cells however big the canvas is
    const S = Math.max(3, Math.ceil(Math.sqrt((w * h) / 40000))), bw = Math.ceil(w / S), bh = Math.ceil(h / S), n = bw * bh, r = fresh(7)
    let A = new Float32Array(n).fill(1), B = new Float32Array(n), A2 = new Float32Array(n), B2 = new Float32Array(n)
    const px = pixels(bw, bh), f = 0.0545, k = 0.062
    const seed = () => { const cx = 4 + Math.floor(r() * (bw - 8)), cy = 4 + Math.floor(r() * (bh - 8)); for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) B[(cy + y) * bw + cx + x] = 1 }
    for (let i = 0; i < Math.max(8, Math.round(n / 4000)); i++) seed()
    let next = 6
    const iterate = () => {
      for (let y = 1; y < bh - 1; y++) for (let x = 1; x < bw - 1; x++) {
        const i = y * bw + x, a = A[i], b = B[i]
        const la = (A[i - 1] + A[i + 1] + A[i - bw] + A[i + bw]) * 0.2 + (A[i - bw - 1] + A[i - bw + 1] + A[i + bw - 1] + A[i + bw + 1]) * 0.05 - a
        const lb = (B[i - 1] + B[i + 1] + B[i - bw] + B[i + bw]) * 0.2 + (B[i - bw - 1] + B[i - bw + 1] + B[i + bw - 1] + B[i + bw + 1]) * 0.05 - b
        const abb = a * b * b
        A2[i] = a + la - abb + f * (1 - a); B2[i] = b + 0.5 * lb + abb - (k + f) * b
      }
      ;[A, A2] = [A2, A]; [B, B2] = [B2, B]
    }
    return {
      frame(t) {
        if (t > next) { seed(); next = t + 5 }
        for (let i = 0; i < 8; i++) iterate()
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const i = y * bw + x; px.set(i, INK, B[i] * 3.2 > BAYER[(y & 3) * 4 + (x & 3)] ? 0.85 : 0) }
        clear(ctx, w, h); px.blit(ctx, S)
      },
    }
  },
}

/* Langton's ants: two dumb rules, chaos for ten thousand steps, then a highway */
const ants: PondDef = {
  id: 'ants', name: 'Langton’s ants', tags: ['automata', 'emergence'], bg: '#1a1917', passive: true,
  idea: 'Eight to ten ants, spread evenly, with one rule: on a dark cell turn right, on a light one turn left, flip it, step. Chaos for a while, then each builds a highway.', hint: 'just watch',
  make(ctx, w, h) {
    const S = 3, C = Math.floor(w / S), R = Math.floor(h / S), grid = new Uint8Array(C * R), px = pixels(C, R), r = fresh(3)
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]
    let crew: { x: number; y: number; d: number }[] = [], steps = 0
    const reset = () => {
      grid.fill(0); steps = 0; crew = []
      // 8 to 10 ants, spread evenly: one per cell of a grid that fits the canvas, at a random spot inside its cell
      const count = 8 + Math.floor(r() * 3), gx = Math.ceil(Math.sqrt((count * C) / R)), gy = Math.ceil(count / gx)
      const cells = Array.from({ length: gx * gy }, (_, k) => k).sort(() => r() - 0.5).slice(0, count)
      for (const k of cells) {
        const cw = C / gx, ch = R / gy
        crew.push({ x: Math.floor(((k % gx) + 0.2 + r() * 0.6) * cw), y: Math.floor((Math.floor(k / gx) + 0.2 + r() * 0.6) * ch), d: Math.floor(r() * 4) })
      }
    }
    reset()
    const limit = Math.max(45000, C * R * 1.2)
    return {
      frame() {
        for (let s = 0; s < 60; s++) for (const a of crew) {
          const i = a.y * C + a.x
          a.d = (a.d + (grid[i] ? 3 : 1)) % 4; grid[i] ^= 1
          a.x = (a.x + DX[a.d] + C) % C; a.y = (a.y + DY[a.d] + R) % R
        }
        steps += 60
        if (steps > limit) reset()
        for (let i = 0; i < C * R; i++) px.set(i, INK, grid[i] ? 0.7 : 0)
        for (const a of crew) px.set(a.y * C + a.x, ACC)
        clear(ctx, w, h); px.blit(ctx, S); ctx.clearRect(4, 4, 96, 18); label(ctx, `step ${steps}`)
      },
    }
  },
}

/* flocking: boids with three rules, and one that leads */
const flock: PondDef = {
  id: 'flock', name: 'Flock', tags: ['simulation', 'boids'], bg: '#1a1917', passive: true,
  idea: 'A school of dashes following three rules: keep apart, align, stay close. One of them wanders off, and the rest decide whether to follow.', hint: 'just watch',
  make(ctx, w, h) {
    const r = fresh(9), N = 90
    const B = Array.from({ length: N }, () => ({ x: r() * w, y: r() * h, vx: (r() - 0.5) * 40, vy: (r() - 0.5) * 40 }))
    let lt = 0
    return {
      frame(t) {
        const dt = Math.min(0.05, t - lt || 0); lt = t
        clear(ctx, w, h)
        const lead = B[0], la = t * 0.3
        lead.vx += Math.cos(la + Math.sin(t * 0.7)) * 40 * dt; lead.vy += Math.sin(la * 1.3) * 40 * dt
        for (let i = 0; i < N; i++) {
          const b = B[i]
          let ax = 0, ay = 0, cx = 0, cy = 0, sx = 0, sy = 0, c = 0
          for (let j = 0; j < N; j++) {
            if (i === j) continue
            let dx = B[j].x - b.x, dy = B[j].y - b.y
            if (dx > w / 2) dx -= w; if (dx < -w / 2) dx += w; if (dy > h / 2) dy -= h; if (dy < -h / 2) dy += h
            const d = Math.hypot(dx, dy)
            if (d < 46) { const wgt = j === 0 ? 6 : 1; ax += B[j].vx * wgt; ay += B[j].vy * wgt; cx += dx * wgt; cy += dy * wgt; c += wgt; if (d < 14) { sx -= dx / (d || 1); sy -= dy / (d || 1) } }
          }
          if (c && i) { b.vx += ((ax / c - b.vx) * 1.6 + (cx / c) * 0.9 + sx * 40) * dt; b.vy += ((ay / c - b.vy) * 1.6 + (cy / c) * 0.9 + sy * 40) * dt }
          const sp = Math.hypot(b.vx, b.vy), max = i ? 62 : 52, min = 24
          if (sp > max) { b.vx *= max / sp; b.vy *= max / sp } else if (sp < min) { b.vx *= min / (sp || 1); b.vy *= min / (sp || 1) }
          b.x = (b.x + b.vx * dt + w) % w; b.y = (b.y + b.vy * dt + h) % h
        }
        const p = new Path2D()
        for (let i = 1; i < N; i++) { const b = B[i], s = Math.hypot(b.vx, b.vy) || 1; p.moveTo(b.x, b.y); p.lineTo(b.x - (b.vx / s) * 7, b.y - (b.vy / s) * 7) }
        ctx.strokeStyle = ink(0.75); ctx.lineWidth = 1; ctx.stroke(p)
        const s = Math.hypot(lead.vx, lead.vy) || 1
        ctx.strokeStyle = acc(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lead.x, lead.y); ctx.lineTo(lead.x - (lead.vx / s) * 9, lead.y - (lead.vy / s) * 9); ctx.stroke()
      },
    }
  },
}

/* cyclic automaton: random noise organises itself into turning spirals, dithered */
const cyclic: PondDef = {
  id: 'cyclic', name: 'Cyclic spirals', tags: ['automata', 'self-organising'], bg: '#1a1917', passive: true,
  idea: 'Fourteen states in a loop; a cell moves on when a neighbour is one ahead. Out of pure noise come spirals that turn forever, like ripples that never stop.', hint: 'just watch',
  make(ctx, w, h) {
    const S = Math.max(3, Math.ceil(Math.sqrt((w * h) / 60000))), C = Math.ceil(w / S), R = Math.ceil(h / S), N = 14, r = fresh(14)
    let a = new Uint8Array(C * R), b = new Uint8Array(C * R)
    for (let i = 0; i < C * R; i++) a[i] = Math.floor(r() * N)
    const px = pixels(C, R)
    const step = () => {
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const i = y * C + x, nx = (a[i] + 1) % N
        b[i] = a[y * C + ((x + 1) % C)] === nx || a[y * C + ((x + C - 1) % C)] === nx || a[((y + 1) % R) * C + x] === nx || a[((y + R - 1) % R) * C + x] === nx ? nx : a[i]
      }
      ;[a, b] = [b, a]
    }
    for (let i = 0; i < 160; i++) step()
    const tick = every(POSE, step)
    let drawn = false
    return {
      frame(t) {
        if (!tick(t) && drawn) return
        drawn = true
        for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { const i = y * C + x, v = a[i] / (N - 1); px.set(i, INK, v * v * 0.95 > BAYER[(y & 3) * 4 + (x & 3)] ? 0.85 : 0) }
        clear(ctx, w, h); px.blit(ctx, S)
      },
    }
  },
}

/* Brian's Brain: cells fire, rest, and wake when exactly two neighbours fire; it fills with tiny ships */
const brain: PondDef = {
  id: 'brain', name: 'Brian’s Brain', tags: ['automata', 'sparks'], bg: '#1a1917', passive: true,
  idea: 'Cells fire, rest, then wake when exactly two neighbours fire. Little ships form and shoot across, crashing into storms.', hint: 'just watch',
  make(ctx, w, h) {
    const S = 4, C = Math.floor(w / S), R = Math.floor(h / S), r = fresh(2)
    let a = new Uint8Array(C * R), b = new Uint8Array(C * R)
    const sprinkle = (cx: number, cy: number, rad: number) => { for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (r() < 0.5) a[((cy + y + R) % R) * C + ((cx + x + C) % C)] = 1 }
    sprinkle(C >> 1, R >> 1, 8); sprinkle(C >> 2, R >> 2, 5)
    const step = () => {
      let on = 0
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const i = y * C + x
        if (a[i] === 1) { b[i] = 2; continue }
        if (a[i] === 2) { b[i] = 0; continue }
        let n = 0
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && a[((y + dy + R) % R) * C + ((x + dx + C) % C)] === 1) n++
        b[i] = n === 2 ? 1 : 0; on += b[i]
      }
      ;[a, b] = [b, a]
      if (on < C * R * 0.01) sprinkle(Math.floor(r() * C), Math.floor(r() * R), 4)
    }
    const tick = every(POSE, step)
    let drawn = false
    return {
      frame(t) {
        if (!tick(t) && drawn) return
        drawn = true; clear(ctx, w, h)
        const fire = new Path2D(), rest = new Path2D()
        for (let i = 0; i < C * R; i++) if (a[i]) (a[i] === 1 ? fire : rest).rect((i % C) * S, Math.floor(i / C) * S, S - 1, S - 1)
        ctx.fillStyle = ink(0.2); ctx.fill(rest); ctx.fillStyle = ink(0.9); ctx.fill(fire)
      },
    }
  },
}

/* glyph rain: the dithered surface, rain only, typed in monospace glyphs (11 and 13 together) */
const RAMP = ['·', '.', ':', '-', '=', '+', '*', '#']
const glyphrain: PondDef = {
  id: 'glyphrain', name: 'Dithered glyph rain', tags: ['dither', 'glyphs'], bg: '#1a1917', passive: true,
  idea: 'The dithered surface and the glyph water together: light falls on the waves, an ordered dither decides which cells speak, and the glyph says how bright. Only rain disturbs it.', hint: 'just watch',
  make(ctx, w, h) {
    const G = 12, C = Math.ceil(w / G), R = Math.ceil(h / G), H = new Float32Array(C * R), RING = new Float32Array(C * R)
    const rings: { x: number; y: number; t0: number }[] = []
    const tick = every(POSE, () => {})
    let drawn = false
    return {
      frame(t) {
        if (!tick(t) && drawn) return
        drawn = true
        if (Math.random() < 0.08) rings.push({ x: Math.random() * C, y: Math.random() * R, t0: t })
        for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t0 > 5) rings.splice(i, 1)
        for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
          let v = Math.sin(x * 0.27 + t * 0.6) * 0.5 + Math.sin(y * 0.39 - t * 0.45 + x * 0.09) * 0.4 + Math.sin((x - y) * 0.15 + t * 0.3) * 0.6, ring = 0
          for (const g of rings) { const age = t - g.t0, d = Math.hypot(x - g.x, y - g.y) - age * 7; if (d > -5 && d < 5) { const k = Math.exp(-(d * d) / 3) * (1 - age / 5); v += Math.cos(d * 1.6) * k * 2; ring = Math.max(ring, k) } }
          H[y * C + x] = v; RING[y * C + x] = ring
        }
        clear(ctx, w, h)
        ctx.font = `11px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const tones = [0.14, 0.32, 0.55, 0.85], byTone: [string, number, number][][] = [[], [], [], []]
        for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
          const i = y * C + x, dx = x ? H[i] - H[i - 1] : 0, dy = y ? H[i] - H[i - C] : 0
          const light = 0.2 + (dx + dy) * 0.55 - (y / R) * 0.1
          if (light <= BAYER[(y & 3) * 4 + (x & 3)] * 0.9) continue
          const g = RAMP[Math.max(0, Math.min(7, Math.floor(light * 8)))], cx = (x + 0.5) * G, cy = (y + 0.5) * G
          if (RING[i] > 0.5) { ctx.fillStyle = acc(0.9); ctx.fillText(g, cx, cy); continue }
          byTone[Math.max(0, Math.min(3, Math.floor(light * 4)))].push([g, cx, cy])
        }
        byTone.forEach((list, k) => { ctx.fillStyle = ink(tones[k]); for (const [g, x, y] of list) ctx.fillText(g, x, y) })
      },
    }
  },
}

/* maze flood: a maze carves itself, then water floods it from one cell, level by level */
const maze: PondDef = {
  id: 'maze', name: 'Maze flood', tags: ['algorithms', 'bfs'], bg: '#1a1917', passive: true,
  idea: 'A depth-first search carves a maze, then a breadth-first flood fills it from one cell, ring by ring like water. Then it drains and starts again.', hint: 'just watch',
  make(ctx, w, h) {
    const G = 12, C = Math.floor(w / G), R = Math.floor(h / G), n = C * R, ox = (w - C * G) / 2 + G / 2, oy = (h - R * G) / 2 + G / 2, r = fresh(5)
    const parent = new Int32Array(n), seen = new Uint8Array(n), adj: number[][] = Array.from({ length: n }, () => [])
    let stack: number[] = [], phase: 'carve' | 'flood' | 'hold' = 'carve', level = 0, maxLevel = 0, hold = 0, carved = 0, head = -1
    const dist = new Int32Array(n)
    const reset = () => {
      parent.fill(-1); seen.fill(0); adj.forEach((a) => (a.length = 0)); dist.fill(-1)
      const s = Math.floor(r() * n); seen[s] = 1; stack = [s]; phase = 'carve'; carved = 1; level = 0
    }
    reset()
    const carve = () => {
      for (let k = 0; k < 14 && stack.length; k++) {
        const c = stack[stack.length - 1], x = c % C, y = (c / C) | 0
        const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < C && b < R && !seen[b * C + a])
        if (!nb.length) { stack.pop(); continue }
        const [a, b] = nb[Math.floor(r() * nb.length)], m = b * C + a
        seen[m] = 1; parent[m] = c; adj[c].push(m); adj[m].push(c); stack.push(m); carved++; head = m
      }
      if (!stack.length) {
        const s = Math.floor(r() * n); dist[s] = 0; let q = [s]; maxLevel = 0
        while (q.length) { const nq: number[] = []; for (const c of q) for (const m of adj[c]) if (dist[m] < 0) { dist[m] = dist[c] + 1; maxLevel = dist[m]; nq.push(m) } q = nq }
        phase = 'flood'; level = 0
      }
    }
    const tick = every(POSE, () => {
      if (phase === 'carve') carve()
      else if (phase === 'flood') { level += 2; if (level > maxLevel + 30) { phase = 'hold'; hold = 24 } }
      else if (--hold <= 0) reset()
    })
    const at = (c: number) => [ox + (c % C) * G, oy + ((c / C) | 0) * G] as const
    return {
      frame(t) {
        tick(t); clear(ctx, w, h)
        const dry = new Path2D(), wet = [new Path2D(), new Path2D(), new Path2D()], front = new Path2D()
        for (let c = 0; c < n; c++) {
          const p = parent[c]; if (p < 0) continue
          const [x0, y0] = at(p), [x1, y1] = at(c)
          let path = dry
          if (phase !== 'carve' && dist[c] >= 0 && dist[c] <= level) {
            const age = level - dist[c]
            path = age < 2 ? front : phase === 'hold' ? wet[0] : dist[c] % 10 < 2 ? wet[2] : age < 14 ? wet[1] : wet[0]
          }
          path.moveTo(x0, y0); path.lineTo(x1, y1)
        }
        ctx.lineWidth = 2; ctx.lineCap = 'square'
        ctx.strokeStyle = ink(phase === 'carve' ? 0.3 : 0.12); ctx.stroke(dry)
        ;[0.4, 0.62, 0.9].forEach((a, k) => { ctx.strokeStyle = ink(a); ctx.stroke(wet[k]) })
        ctx.strokeStyle = acc(); ctx.stroke(front)
        if (phase === 'carve' && head >= 0) { const [x, y] = at(head); ctx.fillStyle = acc(); ctx.fillRect(x - 2, y - 2, 4, 4) }
        ctx.lineCap = 'butt'
        ctx.clearRect(4, 4, 150, 18)
        label(ctx, phase === 'carve' ? `dfs  carved ${carved}/${n}` : `bfs  depth ${Math.min(level, maxLevel)}/${maxLevel}`)
      },
    }
  },
}

/* sandpile: grains dropped on one cell topple onto their neighbours, and a fractal grows */
const sand: PondDef = {
  id: 'sand', name: 'Sandpile', tags: ['math', 'self-organised criticality'], bg: '#1a1917', passive: true,
  idea: 'Grains dropped on one cell. Any cell with four topples, one to each neighbour, setting off avalanches; a fractal grows out of nothing but that.', hint: 'just watch',
  make(ctx, w, h) {
    const S = 3, C = Math.floor(w / S), R = Math.floor(h / S), g = new Uint32Array(C * R), px = pixels(C, R)
    const TONE = [0, 0.28, 0.55, 0.9]
    let grains = 0, hold = 0
    const cx = C >> 1, cy = R >> 1, stack: number[] = []
    return {
      frame(t) {
        if (hold > 0) { if (--hold === 0) { g.fill(0); grains = 0 } }
        else {
          const add = Math.round(60 + Math.min(400, t * 6))
          g[cy * C + cx] += add; grains += add; stack.push(cy * C + cx)
          while (stack.length) {
            const i = stack.pop()!
            if (g[i] < 4) continue
            const q = g[i] >> 2; g[i] &= 3
            const x = i % C, y = (i / C) | 0
            if (x > 0) { g[i - 1] += q; if (g[i - 1] >= 4) stack.push(i - 1) }
            if (x < C - 1) { g[i + 1] += q; if (g[i + 1] >= 4) stack.push(i + 1) }
            if (y > 0) { g[i - C] += q; if (g[i - C] >= 4) stack.push(i - C) }
            if (y < R - 1) { g[i + C] += q; if (g[i + C] >= 4) stack.push(i + C) }
          }
          if (g[cy * C + 1] || g[C + cx]) hold = 90
        }
        for (let i = 0; i < C * R; i++) px.set(i, INK, TONE[Math.min(3, g[i])])
        px.set(cy * C + cx, ACC)
        clear(ctx, w, h); px.blit(ctx, S); ctx.clearRect(4, 4, 120, 18); label(ctx, `grains ${grains}`)
      },
    }
  },
}

/* life in contours: the Game of Life blurred into a height field and drawn as a map */
const lifemap: PondDef = {
  id: 'lifemap', name: 'Life, surveyed', tags: ['automata', 'maps'], bg: '#1a1917', passive: true,
  idea: 'The Game of Life underneath, never shown; only its density, surveyed as contour lines that shift as colonies grow and die.', hint: 'just watch',
  make(ctx, w, h) {
    const S = 6, C = Math.ceil(w / S) + 1, R = Math.ceil(h / S) + 1, L = lifeEngine(C, R, 44), D = new Float32Array(C * R), F = new Float32Array(C * R)
    const tick = every(POSE, L.step), LV = [0.12, 0.22, 0.32, 0.42, 0.52]
    return {
      frame(t) {
        tick(t)
        for (let i = 0; i < C * R; i++) D[i] += (L.a[i] - D[i]) * 0.08
        for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
          let s = 0
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s += D[((y + dy + R) % R) * C + ((x + dx + C) % C)]
          F[y * C + x] = (s / 25) * 2.2
        }
        clear(ctx, w, h)
        LV.forEach((Lv, li) => {
          const p = new Path2D()
          for (let j = 0; j < R - 1; j++) for (let i = 0; i < C - 1; i++) {
            const a = F[j * C + i], b = F[j * C + i + 1], c = F[(j + 1) * C + i + 1], d = F[(j + 1) * C + i]
            const x = i * S, y = j * S, pts: number[] = []
            if ((a > Lv) !== (b > Lv)) pts.push(x + ((Lv - a) / (b - a)) * S, y)
            if ((b > Lv) !== (c > Lv)) pts.push(x + S, y + ((Lv - b) / (c - b)) * S)
            if ((d > Lv) !== (c > Lv)) pts.push(x + ((Lv - d) / (c - d)) * S, y + S)
            if ((a > Lv) !== (d > Lv)) pts.push(x, y + ((Lv - a) / (d - a)) * S)
            for (let k = 0; k + 3 < pts.length; k += 4) { p.moveTo(pts[k], pts[k + 1]); p.lineTo(pts[k + 2], pts[k + 3]) }
          }
          ctx.strokeStyle = li === 4 ? acc(0.9) : ink(0.2 + li * 0.15); ctx.lineWidth = li === 4 ? 1.1 : 0.8; ctx.stroke(p)
        })
      },
    }
  },
}

/** The ponds the home page picks from, one at random per visit. */
export const HOME_PONDS: PondDef[] = [life, wolfram, turing, ants, cyclic, brain, glyphrain]
export const AUTO_PONDS: PondDef[] = [life, wolfram, turing, ants, flock, cyclic, brain, maze, sand, lifemap, glyphrain]
