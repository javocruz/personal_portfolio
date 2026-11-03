import { fbm, type PondDef } from './kit'
import { CODE_PONDS } from './code'
import { AUTO_PONDS } from './auto'

const near = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

/* 1 · glyph water: the current placeholder, small */
const glyphs: PondDef = {
  id: 'glyphs', name: 'Glyph water', tags: ['you liked', 'current'], bg: '#1a1917',
  idea: 'The pond on the site now: still water typed in monospace, rain and cursor rings.', hint: 'move the cursor',
  make(ctx, w, h) {
    const RAMP = ['·', '.', ':', '-', '=', '+', '*', '#'], C = 14, cols = Math.ceil(w / C), rows = Math.ceil(h / C)
    const rings: { x: number; y: number; t0: number; s: number }[] = []
    let last = 0
    return {
      frame(t, p) {
        ctx.fillStyle = '#1a1917'; ctx.fillRect(0, 0, w, h)
        for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t0 > 3) rings.splice(i, 1)
        if (Math.random() < 0.02) rings.push({ x: Math.random() * w, y: Math.random() * h, t0: t, s: 0.9 })
        if (p.on && t - last > 0.12) { rings.push({ x: p.x, y: p.y, t0: t, s: 0.6 }); last = t }
        ctx.font = "11px 'Geist Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const x = (i + 0.5) * C, y = (j + 0.5) * C
          const s = (Math.sin(x * 0.02 + t * 0.35) * Math.cos(y * 0.024 - t * 0.27) * 0.55 + Math.sin((x + y) * 0.012 - t * 0.21) * 0.45) * 0.5 + 0.5
          let r = 0
          for (const g of rings) { const age = t - g.t0, d = near(x, y, g.x, g.y); r = Math.max(r, Math.exp(-((d - age * 90) ** 2) / 160) * (1 - age / 3) * g.s) }
          const v = Math.max(s * s * 0.62, r)
          if (v < 0.22) continue
          ctx.fillStyle = r > 0.8 ? 'rgba(224,122,63,.9)' : `rgba(255,247,240,${0.12 + v * 0.7})`
          ctx.fillText(RAMP[Math.min(7, Math.floor(v * 8))], x, y)
        }
      },
    }
  },
}

/* 6 · ordered dither: the water lit from the top corner, drawn in two tones with a 4x4 Bayer matrix */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const dither: PondDef = {
  id: 'dither', name: 'Dithered surface', tags: ['you liked', '1-bit'], bg: '#1a1917',
  idea: 'Two tones only. Light from the top corner falls on moving waves; the dots get denser where it hits.', hint: 'move or click for ripples',
  make(ctx, w, h) {
    const S = 3, bw = Math.ceil(w / S), bh = Math.ceil(h / S)
    const small = document.createElement('canvas'); small.width = bw; small.height = bh
    const sx = small.getContext('2d')!, img = sx.createImageData(bw, bh), H = new Float32Array(bw * bh)
    const rings: { x: number; y: number; t0: number }[] = []
    let last = 0
    return {
      click(x, y) { rings.push({ x: x / S, y: y / S, t0: performance.now() / 1000 }) },
      frame(t, p) {
        if (p.on && t - last > 0.25) { rings.push({ x: p.x / S, y: p.y / S, t0: t }); last = t }
        if (Math.random() < 0.01) rings.push({ x: Math.random() * bw, y: Math.random() * bh, t0: t })
        for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t0 > 4) rings.splice(i, 1)
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
          let v = Math.sin(x * 0.09 + t * 0.7) * 0.5 + Math.sin(y * 0.13 - t * 0.5 + x * 0.03) * 0.4 + Math.sin((x - y) * 0.05 + t * 0.3) * 0.6
          for (const g of rings) { const age = t - g.t0, d = Math.hypot(x - g.x, y - g.y) - age * 30; if (d > -20 && d < 20) v += Math.cos(d * 0.5) * Math.exp(-(d * d) / 80) * (1 - age / 4) * 1.8 }
          H[y * bw + x] = v
        }
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
          const i = y * bw + x, dx = x ? H[i] - H[i - 1] : 0, dy = y ? H[i] - H[i - bw] : 0
          const light = 0.16 + (dx + dy) * 1.6 - (y / bh) * 0.1 + (1 - x / bw) * 0.06
          const on = light > BAYER[(y & 3) * 4 + (x & 3)], o = i * 4
          img.data[o] = on ? 255 : 26; img.data[o + 1] = on ? 247 : 25; img.data[o + 2] = on ? 240 : 23; img.data[o + 3] = 255
        }
        sx.putImageData(img, 0, 0)
        ctx.imageSmoothingEnabled = false; ctx.drawImage(small, 0, 0, bw * S, bh * S); ctx.imageSmoothingEnabled = true
      },
    }
  },
}

/* 11 · contours: the water as a topographic map, a stone where the cursor rests */
const contours: PondDef = {
  id: 'contours', name: 'Contour map', tags: ['you liked', 'maps'], bg: '#1a1917',
  idea: 'The pond surveyed: moving height lines like a topographic map; the cursor presses a stone into it.', hint: 'rest the cursor, click to drop a stone',
  make(ctx, w, h) {
    const G = 8, cols = Math.ceil(w / G) + 1, rows = Math.ceil(h / G) + 1, F = new Float32Array(cols * rows)
    const stones: { x: number; y: number; t0: number }[] = []
    let now = 0
    const LV = Array.from({ length: 13 }, (_, i) => 0.2 + i * 0.05)
    return {
      click: (x, y) => { stones.push({ x, y, t0: now }); if (stones.length > 6) stones.shift() },
      frame(t, p) {
        now = t
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const x = i * G, y = j * G
          let v = fbm(x * 0.006 + t * 0.03, y * 0.006 - t * 0.02)
          if (p.on) v += 0.22 * Math.exp(-(((x - p.x) ** 2 + (y - p.y) ** 2) / 1800))
          for (const s of stones) { const age = t - s.t0; v += 0.3 * Math.exp(-age / 5) * Math.exp(-(((x - s.x) ** 2 + (y - s.y) ** 2) / 900)) }
          F[j * cols + i] = v
        }
        ctx.fillStyle = '#1a1917'; ctx.fillRect(0, 0, w, h)
        LV.forEach((L, li) => {
          ctx.beginPath()
          for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
            const a = F[j * cols + i], b = F[j * cols + i + 1], c = F[(j + 1) * cols + i + 1], d = F[(j + 1) * cols + i]
            const x = i * G, y = j * G, pts: number[] = []
            if ((a > L) !== (b > L)) pts.push(x + ((L - a) / (b - a)) * G, y)
            if ((b > L) !== (c > L)) pts.push(x + G, y + ((L - b) / (c - b)) * G)
            if ((d > L) !== (c > L)) pts.push(x + ((L - d) / (c - d)) * G, y + G)
            if ((a > L) !== (d > L)) pts.push(x, y + ((L - a) / (d - a)) * G)
            for (let k = 0; k + 3 < pts.length; k += 4) { ctx.moveTo(pts[k], pts[k + 1]); ctx.lineTo(pts[k + 2], pts[k + 3]) }
          }
          ctx.strokeStyle = li === 8 ? 'rgba(224,122,63,.85)' : li % 4 === 0 ? 'rgba(255,247,240,.6)' : 'rgba(255,247,240,.22)'
          ctx.lineWidth = li % 4 === 0 ? 1.1 : 0.7
          ctx.stroke()
        })
      },
    }
  },
}

// the three you liked, left to run by themselves: only the rain moves them
const still = (p: PondDef, name: string, idea: string): PondDef => ({ ...p, id: `${p.id}-still`, name, idea, hint: 'just watch', tags: ['you liked', 'passive'], passive: true })

export const ROUNDS: { title: string; note: string; ponds: PondDef[] }[] = [
  {
    title: 'round three · they run themselves',
    note: 'No cursor. Automata and small simulations stepping at the site’s pace (12 a second), plus the three you liked, left alone in the rain.',
    ponds: [
      ...AUTO_PONDS,
      still(dither, 'Dithered rain', 'The dithered surface with no cursor: only raindrops disturb it.'),
      still(contours, 'Contours, drifting', 'The contour map left alone, slowly drifting.'),
      still(glyphs, 'Glyph rain', 'The glyph water with only rain on it.'),
    ],
  },
  { title: 'round two · cursor driven', note: 'Move over them, click to drop a stone.', ponds: [...CODE_PONDS, dither, contours, glyphs] },
]
