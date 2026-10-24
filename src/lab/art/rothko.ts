/**
 * Core's Rothko paintings, in plain Canvas 2D. Ported from the prototype generators: helpers first, then Rothko.
 * A painting is a pure function of (ctx, W, H, projectId, seed): the same seed paints the same picture at any size.
 *
 * The rule: the data nudges the painting, it doesn't draw it. It sets the proportions and the colours; the caption
 * (`note`) tells the story. Baked once, offline (see /lab/bake?core), so render cost doesn't matter.
 */
import type { L } from '../../content/types'
import { NOTES } from './notes'

/** Scales the detail passes beyond the prototype: glazes, edge blobs, scumble strokes. */
export const DETAIL = 2

// ---------- helpers ----------
export type Rand = () => number
export const mulberry = (a: number): Rand => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const hex2hsl = (h: string): [number, number, number] => {
  const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  let H = 0, S = 0
  const L = (mx + mn) / 2
  if (mx !== mn) {
    const d = mx - mn
    S = L > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    H = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
    H *= 60
  }
  return [H, S * 100, L * 100]
}
export const hsl = (h: number, s: number, l: number) => `hsl(${((h % 360) + 360) % 360} ${Math.max(0, Math.min(100, s))}% ${Math.max(0, Math.min(100, l))}%)`
/** A colour nudged a little in hue, saturation and lightness. */
export const jit = (hex: string, R: Rand, dh = 4, ds = 4, dl = 5) => { const [h, s, l] = hex2hsl(hex); return hsl(h + (R() - 0.5) * 2 * dh, s + (R() - 0.5) * 2 * ds, l + (R() - 0.5) * 2 * dl) }
export const shade = (hex: string, dl: number, ds = 0) => { const [h, s, l] = hex2hsl(hex); return hsl(h, s + ds, l + dl) }
/** A colour moved round the wheel, as HSL parts (for the underlayer: redder under orange, violet under blue). */
export const turn = (hex: string, dh: number, dl = 0, ds = 0): [number, number, number] => { const [h, s, l] = hex2hsl(hex); return [h + dh, s + ds, l + dl] }
/** Like jit, but for a colour given as HSL parts. */
export const jitHsl = ([h, s, l]: [number, number, number], R: Rand, dh = 4, ds = 4, dl = 5) => hsl(h + (R() - 0.5) * 2 * dh, s + (R() - 0.5) * 2 * ds, l + (R() - 0.5) * 2 * dl)
export const mk = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c }
/** A cheap, consistent blur: shrink in two steps, then the caller scales it back up. */
export function blurred(src: HTMLCanvasElement, f: number) {
  const a = mk(src.width / Math.sqrt(f), src.height / Math.sqrt(f)), b = mk(src.width / f, src.height / f)
  const ax = a.getContext('2d')!, bx = b.getContext('2d')!
  ax.imageSmoothingQuality = bx.imageSmoothingQuality = 'high'
  ax.drawImage(src, 0, 0, a.width, a.height); bx.drawImage(a, 0, 0, b.width, b.height)
  return b
}
let GRAIN: HTMLCanvasElement | null = null
function grain() {
  if (GRAIN) return GRAIN
  GRAIN = mk(256, 256)
  const x = GRAIN.getContext('2d')!, d = x.createImageData(256, 256), R = mulberry(99)
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (R() - 0.5) * 110; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
  x.putImageData(d, 0, 0)
  return GRAIN
}
export function finish(ctx: CanvasRenderingContext2D, W: number, H: number, amt: number) {
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = amt
  ctx.fillStyle = ctx.createPattern(grain(), 'repeat')!; ctx.fillRect(0, 0, W, H)
  ctx.restore()
}
/** Fine canvas weave over everything. */
export function weave(ctx: CanvasRenderingContext2D, W: number, H: number, alpha = 0.022) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#000'; ctx.lineWidth = Math.max(0.5, W / 900)
  const step = Math.max(2, W / 260)
  ctx.beginPath()
  for (let x = 0; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H) }
  for (let y = 0; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y) }
  ctx.stroke(); ctx.restore()
}
/** Hairline cracks in old paint. `amount` is the number of cracks; alpha scales how visible they are. */
export function craquelure(ctx: CanvasRenderingContext2D, W: number, H: number, P: Rand, amount: number, alpha = 1) {
  ctx.save(); ctx.lineWidth = Math.max(0.5, W * 0.0009); ctx.lineJoin = 'round'
  for (let i = 0; i < amount; i++) {
    let x = P() * W, y = P() * H, a = P() * Math.PI * 2
    ctx.globalAlpha = (0.04 + P() * 0.06) * alpha; ctx.strokeStyle = P() < 0.5 ? '#3a3128' : '#ffffff'
    ctx.beginPath(); ctx.moveTo(x, y)
    const steps = 4 + Math.floor(P() * 9)
    for (let s = 0; s < steps; s++) {
      a += (P() - 0.5) * 1.6
      const l = (0.006 + P() * 0.02) * W
      x += Math.cos(a) * l; y += Math.sin(a) * l; ctx.lineTo(x, y)
      if (P() < 0.25) { ctx.moveTo(x, y); a += (P() < 0.5 ? 1 : -1) * (0.8 + P()) }
    }
    ctx.stroke()
  }
  ctx.restore(); ctx.globalAlpha = 1
}

// ---------- projects ----------
export const PROJECT_IDS = ['frost', 'maps', 'iris', 'chain', 'hills'] as const
export type ProjectId = (typeof PROJECT_IDS)[number]

// ---------- ROTHKO ----------
// Fields nearly fill the canvas, edges dissolve outward, colours sit close and saturated over a stained ground.
type Palette = { ground: string; fields: string[] }
export const ROTHKO: Record<ProjectId, { note: L; palettes: Palette[]; h: number[] }> = {
  frost: {
    note: NOTES.rothko.frost,
    palettes: [{ ground: '#1b2136', fields: ['#2c4790', '#a7bacb'] }, { ground: '#121a2c', fields: ['#1f356f', '#6f8fb0'] }, { ground: '#2a2f45', fields: ['#3a4f8c', '#c9d3d9'] }], h: [1.5, 1.29],
  },
  maps: {
    note: NOTES.rothko.maps,
    palettes: [{ ground: '#4a150f', fields: ['#d2481f', '#9a2d17'] }, { ground: '#2f0d0a', fields: ['#e0552b', '#7e2414'] }, { ground: '#5c2412', fields: ['#e57a2c', '#b5401c'] }], h: [1.0, 0.55],
  },
  iris: {
    note: NOTES.rothko.iris,
    palettes: [{ ground: '#24182a', fields: ['#3b5d9b', '#5f3a6b', '#b3392b'] }, { ground: '#1a1a2a', fields: ['#2f4f8f', '#7a3f6e', '#c4472f'] }], h: [1.0, 0.18, 0.85],
  },
  chain: {
    note: NOTES.rothko.chain,
    palettes: [{ ground: '#6b3c15', fields: ['#d9a03c', '#8f1c19', '#c8862b'] }, { ground: '#4e2a12', fields: ['#e2b04d', '#a01f1a', '#b8772a'] }, { ground: '#7a4a1c', fields: ['#e6c066', '#7c1616', '#d49a3a'] }], h: [1.0, 0.16, 0.8],
  },
  // TODO(javi): real CO₂ / land / water shares. projects.ts has no figures, so these are placeholders.
  hills: {
    note: NOTES.rothko.hills,
    palettes: [{ ground: '#3a2616', fields: ['#e0662a', '#8a893a', '#3f6a8f'] }, { ground: '#2b1c12', fields: ['#d4552a', '#6f7a34', '#2f5878'] }], h: [0.45, 0.3, 0.25],
  },
}

/**
 * The hue the underlayer leans to under each field: redder under orange, violet under blue, a deeper ochre under
 * ochre. It is a little brighter and more saturated than the field, so the seam it leaves at the edge glows instead of
 * reading as a dark rim.
 */
const underHue = (hex: string) => {
  const [h] = hex2hsl(hex)
  if (h >= 190 && h <= 260) return turn(hex, 26, 5, 12) // blue → violet
  if (h >= 35 && h < 60) return turn(hex, -9, 2, 14) // ochre → deeper, warmer ochre
  if (h < 35 || h > 330) return turn(hex, -10, 3, 12) // orange / red → redder
  return turn(hex, -16, 4, 10)
}

/**
 * One Rothko, as a set of steps. Each step is a function so the plate wrappers (plates-rothko.ts) can put a layer('…')
 * before it; running the steps in order is the whole painting.
 *
 * Randomness: `R` is the prototype's stream (`mulberry(seed * 7919 + 13)`), used in the prototype's order, so a seed
 * keeps its palette and layout. Everything added beyond the prototype (underlayer, lighter cores, drips, second
 * scumble, surface) draws from `X`, so it never shifts the original composition.
 */
export function rothko(ctx: CanvasRenderingContext2D, W: number, H: number, pid: ProjectId, seed: number) {
  const R = mulberry(seed * 7919 + 13), X = mulberry(seed * 7919 + 101)
  const spec = ROTHKO[pid], pal = spec.palettes[Math.floor(R() * spec.palettes.length)]
  type Field = { col: string; y: number; fh: number }
  let fields: Field[] = []
  let mX = 0

  const ground = () => {
    // a flat stain plus soft mottling
    ctx.fillStyle = pal.ground; ctx.fillRect(0, 0, W, H)
    const g = mk(W, H), gx = g.getContext('2d')!
    for (let i = 0; i < 26; i++) {
      gx.globalAlpha = 0.08 + R() * 0.1; gx.fillStyle = shade(pal.ground, (R() - 0.5) * 16)
      gx.beginPath(); gx.ellipse(R() * W, R() * H, (0.15 + R() * 0.35) * W, (0.1 + R() * 0.25) * H, R() * 3, 0, 7); gx.fill()
    }
    ctx.drawImage(blurred(g, 14), 0, 0, W, H)
    // layout (the prototype draws it right after the ground)
    mX = (0.05 + R() * 0.035) * W
    const mY = (0.04 + R() * 0.03) * H, gap = (0.025 + R() * 0.025) * H
    const hs = spec.h.map((v) => v * (0.88 + R() * 0.24)), n = hs.length, avail = H - 2 * mY - gap * (n - 1), sum = hs.reduce((a, b) => a + b, 0)
    let y = mY
    fields = pal.fields.map((col, k) => { const f = { col, y, fh: (hs[k] / sum) * avail }; y += f.fh + gap; return f })
  }

  const underlayer = () => {
    // a slightly larger field in a neighbouring hue under each one; the fields cover it, so it only shows as a thin
    // glowing seam at the edges, the way Rothko's underpainting does
    const U = mk(W, H), ux = U.getContext('2d')!
    for (const f of fields) {
      const grow = (0.008 + X() * 0.006) * W
      for (let i = 0; i < 14 * DETAIL; i++) {
        const j = (X() - 0.5) * 0.006 * W
        ux.globalAlpha = 0.06 + X() * 0.05; ux.fillStyle = jitHsl(underHue(f.col), X, 3, 4, 3)
        ux.fillRect(mX - grow + j, f.y - grow * 0.8 + j, W - 2 * mX + grow * 2, f.fh + grow * 1.6)
      }
    }
    ctx.globalAlpha = 0.85; ctx.drawImage(blurred(U, 10), 0, 0, W, H)
    ctx.globalAlpha = 0.5; ctx.drawImage(blurred(U, 4), 0, 0, W, H)
    ctx.globalAlpha = 1
  }

  const field = (k: number) => {
    const { col, y, fh } = fields[k]
    const fx = mX + (R() - 0.5) * 0.01 * W, fw = W - 2 * mX + (R() - 0.5) * 0.015 * W
    const Lc = mk(W, H), lx = Lc.getContext('2d')!
    // many faint, jittered glazes
    for (let i = 0; i < 46 * DETAIL; i++) {
      const ins = R() * 0.018 * W, jx = (R() - 0.5) * 0.02 * W, jy = (R() - 0.5) * 0.012 * H
      lx.globalAlpha = 0.06 + R() * 0.06; lx.fillStyle = jit(col, R, 3, 5, 6)
      lx.fillRect(fx + ins + jx, y + ins * 0.6 + jy, fw - 2 * ins, fh - 1.2 * ins)
    }
    // feathered edges: soft blobs along the perimeter, pushing outward
    for (let i = 0; i < 90 * DETAIL; i++) {
      const side = R(), t = R()
      let px: number, py: number
      if (side < 0.35) { px = fx + t * fw; py = y + (R() - 0.5) * 0.02 * H }
      else if (side < 0.7) { px = fx + t * fw; py = y + fh + (R() - 0.5) * 0.02 * H }
      else if (side < 0.85) { px = fx + (R() - 0.5) * 0.02 * W; py = y + t * fh }
      else { px = fx + fw + (R() - 0.5) * 0.02 * W; py = y + t * fh }
      lx.globalAlpha = 0.05 + R() * 0.06; lx.fillStyle = jit(col, R, 3, 6, 8)
      lx.beginPath(); lx.ellipse(px, py, (0.01 + R() * 0.03) * W, (0.006 + R() * 0.014) * H, 0, 0, 7); lx.fill()
    }
    // dry-brush scumble inside the field: the broad horizontal pass
    lx.save(); lx.beginPath(); lx.rect(fx + 0.01 * W, y + 0.008 * H, fw - 0.02 * W, fh - 0.016 * H); lx.clip(); lx.lineCap = 'round'
    for (let i = 0; i < 260 * DETAIL; i++) {
      const sy = y + R() * fh, sx = fx + R() * fw * 0.8, len = (0.15 + R() * 0.6) * fw
      lx.globalAlpha = 0.035 + R() * 0.07; lx.strokeStyle = shade(col, (R() - 0.45) * 22, (R() - 0.5) * 10); lx.lineWidth = Math.max(1, (0.002 + R() * 0.007) * H)
      lx.beginPath(); lx.moveTo(sx, sy)
      for (let s = 1; s <= 6; s++) lx.lineTo(sx + (len * s) / 6, sy + (R() - 0.5) * 0.006 * H)
      lx.stroke()
    }
    lx.restore()
    // a lighter core, so the field glows from inside
    const core = lx.createRadialGradient(fx + fw / 2, y + fh / 2, 0, fx + fw / 2, y + fh / 2, Math.max(fw, fh) * 0.55)
    core.addColorStop(0, shade(col, 9 + X() * 4)); core.addColorStop(1, shade(col, 0).replace(')', ' / 0)'))
    lx.save(); lx.beginPath(); lx.rect(fx + 0.02 * W, y + 0.015 * H, fw - 0.04 * W, fh - 0.03 * H); lx.clip()
    lx.globalAlpha = 0.16 + X() * 0.08; lx.fillStyle = core; lx.fillRect(fx, y, fw, fh); lx.restore()
    // composite: a wide soft halo, then the body with a gentler blur, then the sharp body itself feathered at its edges
    // (a soft-edged mask), so the brushwork stays crisp inside but no edge ever reads as a hard line
    ctx.globalAlpha = 0.5; ctx.drawImage(blurred(Lc, 20), 0, 0, W, H)
    ctx.globalAlpha = 0.7; ctx.drawImage(blurred(Lc, 14), 0, 0, W, H)
    const m = mk(W, H), mx = m.getContext('2d')!, inset = 0.03 * W
    mx.fillStyle = '#000'; mx.fillRect(fx + inset, y + inset, fw - inset * 2, fh - inset * 2)
    const soft = mk(W, H), sx = soft.getContext('2d')!
    sx.drawImage(Lc, 0, 0); sx.globalCompositeOperation = 'destination-in'; sx.drawImage(blurred(m, 22), 0, 0, W, H)
    ctx.globalAlpha = 0.85; ctx.drawImage(soft, 0, 0, W, H)
    ctx.globalAlpha = 1
  }

  const scumble = () => {
    // the second, finer pass: diagonal, very low alpha, across every field
    for (const f of fields) {
      ctx.save(); ctx.beginPath(); ctx.rect(mX + 0.015 * W, f.y + 0.012 * H, W - 2 * mX - 0.03 * W, f.fh - 0.024 * H); ctx.clip(); ctx.lineCap = 'round'
      for (let i = 0; i < 180 * DETAIL; i++) {
        const sx = mX + X() * (W - 2 * mX), sy = f.y + X() * f.fh, len = (0.04 + X() * 0.12) * W, a = -0.5 + (X() - 0.5) * 0.3
        ctx.globalAlpha = 0.015 + X() * 0.025; ctx.strokeStyle = shade(f.col, (X() - 0.5) * 18); ctx.lineWidth = Math.max(0.8, (0.001 + X() * 0.003) * H)
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len); ctx.stroke()
      }
      ctx.restore()
    }
    // thin drips: one or two faint vertical runs on some seeds
    if (X() < 0.55) {
      const runs = 1 + Math.floor(X() * 2)
      for (let i = 0; i < runs; i++) {
        const f = fields[Math.floor(X() * fields.length)], x = mX + (0.08 + X() * 0.84) * (W - 2 * mX), y0 = f.y + f.fh * (0.6 + X() * 0.3), len = (0.04 + X() * 0.1) * H
        const g = ctx.createLinearGradient(0, y0, 0, y0 + len)
        g.addColorStop(0, shade(f.col, -8)); g.addColorStop(1, shade(f.col, -8).replace(')', ' / 0)'))
        ctx.globalAlpha = 0.03 + X() * 0.025; ctx.fillStyle = g; ctx.fillRect(x, y0, Math.max(1, W * 0.0025), len)
      }
      ctx.globalAlpha = 1
    }
  }

  const surface = () => {
    // a quiet vignette, a faint craquelure and canvas weave, then grain
    const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.85)
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.22)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H)
    craquelure(ctx, W, H, X, 70, 0.35)
    weave(ctx, W, H, 0.02)
    finish(ctx, W, H, 0.1)
  }

  return { palette: pal, ground, underlayer, field, scumble, surface, get fields() { return fields.length } }
}
