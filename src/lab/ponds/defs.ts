import { projects } from '../../content/projects'
import { dab, fbm, layer, noise, pick, rng, type PondDef } from './kit'

const TAU = Math.PI * 2
const near = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

/* 1 · glyph water: the current placeholder, small */
const glyphs: PondDef = {
  id: 'glyphs', name: 'Glyph water', tags: ['design', 'current'], bg: '#1a1917',
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

/* 2 · after Monet's Water Lilies: impressionist dabs, pads that drift, light that glints */
const MONET = { deep: ['#2b3a67', '#33507e', '#3e5f8a'], sky: ['#6b8fb5', '#8eaecb', '#b9cfe0', '#dbe6ea'], violet: ['#7d6b9e', '#a89cc8', '#8b7bb0'], green: ['#3f6a4e', '#4f7a5a', '#7fa66b', '#a9c47c'] }
const monet: PondDef = {
  id: 'monet', name: 'Water Lilies, after Monet', tags: ['art', 'impressionism'], bg: '#33507e',
  idea: 'Giverny in short brushstrokes: willow reflections, violet sky, lily pads drifting, light glinting on the water.', hint: 'move the cursor to push the pads',
  make(ctx, w, h) {
    const r = rng(1926), base = layer(w, h), b = base.x
    b.fillStyle = '#34507a'; b.fillRect(0, 0, w, h)
    for (let i = 0; i < (w * h) / 55; i++) {
      const x = r() * w, y = r() * h, z = noise(x * 0.008, y * 0.011), band = noise(3.3, y * 0.02 + x * 0.002)
      let col: string, ang = Math.PI / 2 + (r() - 0.5) * 0.5
      if (band > 0.66) { col = pick(r, MONET.sky); ang = (r() - 0.5) * 0.35 }
      else if (z > 0.6 && y < h * 0.55) col = pick(r, MONET.green)
      else if (z < 0.33) col = pick(r, MONET.violet)
      else col = pick(r, r() < 0.7 ? MONET.deep : MONET.sky)
      b.globalAlpha = 0.45 + r() * 0.4
      dab(b, x, y, 4 + r() * 8, 1.2 + r() * 1.6, ang, col)
    }
    b.globalAlpha = 1
    const pads = Array.from({ length: 10 }, (_, k) => {
      const y = h * (0.15 + r() * 0.8), s = 0.5 + y / h, rx = (22 + r() * 30) * s, ry = rx * 0.36
      const L = layer(rx * 2 + 20, ry * 2 + 30), x = L.x, cx = rx + 10, cy = ry + 20
      for (let i = 0; i < 70; i++) {
        const a = r() * TAU, d = Math.sqrt(r())
        x.globalAlpha = 0.6 + r() * 0.35
        dab(x, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 3 + r() * 6, 1 + r() * 1.4, (r() - 0.5) * 0.4, pick(r, d > 0.8 ? ['#2f5a3e', '#3f6a4e'] : MONET.green))
      }
      if (k % 2 === 0) for (let i = 0; i < 16; i++) {
        x.globalAlpha = 0.85
        dab(x, cx + (r() - 0.5) * rx * 0.5, cy - 4 - r() * 8, 1.5 + r() * 2.5, 1 + r() * 1.5, (r() - 0.5) * 1.6, pick(r, ['#e8a6b8', '#f2d0d8', '#f7f1e3', '#d98aa0']))
        if (i === 15) dab(x, cx, cy - 7, 2, 1.5, 0, '#e9c46a')
      }
      return { L, x: r() * w, y, ph: r() * TAU, ox: 0, oy: 0, vx: 0, vy: 0, w: rx * 2 + 20, h: ry * 2 + 30 }
    })
    const glints = Array.from({ length: 170 }, () => ({ x: r() * w, y: r() * h, k: r() * 100 }))
    let lt = 0
    return {
      frame(t, p) {
        const dt = Math.min(0.05, t - lt || 0); lt = t
        ctx.drawImage(base.c, 0, 0, w, h)
        for (const g of glints) {
          let a = Math.max(0, noise(g.k, t * 0.6) - 0.55) * 2.2
          if (p.on) a += Math.max(0, 1 - near(g.x, g.y, p.x, p.y) / 70) * 0.8
          if (a < 0.03) continue
          ctx.globalAlpha = Math.min(1, a)
          dab(ctx, g.x + Math.sin(t + g.k) * 2, g.y, 3 + (g.k % 4), 0.9, 0, '#e6eef2')
        }
        ctx.globalAlpha = 1
        for (const q of pads) {
          if (p.on) { const d = near(q.x + q.ox, q.y + q.oy, p.x, p.y); if (d < 60) { q.vx += ((q.x + q.ox - p.x) / d) * 260 * dt; q.vy += ((q.y + q.oy - p.y) / d) * 120 * dt } }
          q.vx += -q.ox * 2 * dt; q.vy += -q.oy * 2 * dt; q.vx *= 0.96; q.vy *= 0.96; q.ox += q.vx * dt; q.oy += q.vy * dt
          ctx.drawImage(q.L.c, q.x + q.ox + Math.sin(t * 0.15 + q.ph) * 4 - q.w / 2, q.y + q.oy + Math.cos(t * 0.12 + q.ph) * 1.5 - q.h / 2, q.w, q.h)
        }
      },
    }
  },
}

/* 3 · water striders: they skate in bursts, dimple the surface, and scatter from the cursor */
const striders: PondDef = {
  id: 'striders', name: 'Water striders', tags: ['animals', 'nature'], bg: '#1d241c',
  idea: 'Insects that walk on water. Each push leaves rings; each foot a small dimple of light.', hint: 'chase them with the cursor',
  make(ctx, w, h) {
    const r = rng(8)
    const base = layer(w, h), b = base.x, g = b.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#222b20'); g.addColorStop(1, '#151a14'); b.fillStyle = g; b.fillRect(0, 0, w, h)
    for (let i = 0; i < 40; i++) { b.globalAlpha = 0.06; dab(b, r() * w, r() * h, 40 + r() * 90, 10 + r() * 20, 0, '#4b5a3c') }
    const bugs = Array.from({ length: 7 }, () => ({ x: r() * w, y: r() * h, a: r() * TAU, vx: 0, vy: 0, next: r() * 2 }))
    const rings: { x: number; y: number; t0: number }[] = []
    let lt = 0
    return {
      frame(t, p) {
        const dt = Math.min(0.05, t - lt || 0); lt = t
        ctx.drawImage(base.c, 0, 0, w, h)
        for (const s of bugs) {
          const fear = p.on && near(s.x, s.y, p.x, p.y) < 90
          if (t > s.next || (fear && t > s.next - 1.2)) {
            if (fear) s.a = Math.atan2(s.y - p.y, s.x - p.x) + (r() - 0.5) * 0.6; else s.a += (r() - 0.5) * 1.4
            if (s.x < 30) s.a = 0; if (s.x > w - 30) s.a = Math.PI; if (s.y < 30) s.a = Math.PI / 2; if (s.y > h - 30) s.a = -Math.PI / 2
            const sp = fear ? 160 : 60 + r() * 60
            s.vx = Math.cos(s.a) * sp; s.vy = Math.sin(s.a) * sp; s.next = t + (fear ? 0.35 : 0.7 + r() * 1.8)
            for (const k of [-1, 1]) rings.push({ x: s.x - Math.cos(s.a) * 6 + Math.cos(s.a + k * 1.6) * 8, y: s.y - Math.sin(s.a) * 6 + Math.sin(s.a + k * 1.6) * 8, t0: t })
          }
          const f = Math.exp(-dt * 2.4); s.vx *= f; s.vy *= f; s.x += s.vx * dt; s.y += s.vy * dt
          s.x = Math.max(8, Math.min(w - 8, s.x)); s.y = Math.max(8, Math.min(h - 8, s.y))
        }
        for (let i = rings.length - 1; i >= 0; i--) {
          const age = t - rings[i].t0
          if (age > 2) { rings.splice(i, 1); continue }
          ctx.strokeStyle = `rgba(225,232,205,${0.32 * (1 - age / 2)})`; ctx.lineWidth = 0.8
          ctx.beginPath(); ctx.arc(rings[i].x, rings[i].y, 2 + age * 26, 0, TAU); ctx.stroke()
        }
        for (const s of bugs) {
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a)
          const legs: [number, number, number, number][] = [[3, 0, 9, 5], [3, 0, 9, -5], [0, 0, -2, 14], [0, 0, -2, -14], [-1, 0, -16, 9], [-1, 0, -16, -9]]
          ctx.strokeStyle = 'rgba(216,210,188,.7)'; ctx.lineWidth = 0.7
          for (const [x0, y0, x1, y1] of legs) {
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y1 * 0.9 + (y1 > 0 ? 2 : -2), x1, y1); ctx.stroke()
            ctx.strokeStyle = 'rgba(235,240,220,.45)'; ctx.beginPath(); ctx.arc(x1, y1, 2.4, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(216,210,188,.7)'
          }
          dab(ctx, -1, 0, 7, 1.6, 0, '#d8d2bc')
          ctx.restore()
        }
      },
    }
  },
}

/* 4 · project lilies: one pad per project, opens into a flower on hover, click to visit */
const lilies: PondDef = {
  id: 'lilies', name: 'Project lilies', tags: ['your work', 'navigation'], bg: '#142420',
  idea: 'Each pad is a project. Hover and it flowers with the name; click and you go to it.', hint: 'hover a pad, click to open',
  make(ctx, w, h) {
    const r = rng(4)
    const pads = projects.map((pr) => ({ slug: pr.slug, title: pr.title, x: 50 + r() * (w - 100), y: 40 + r() * (h - 90), vx: (r() - 0.5) * 6, vy: (r() - 0.5) * 4, R: 26 + r() * 12, rot: r() * TAU, open: 0 }))
    let hover: (typeof pads)[number] | null = null, lt = 0
    return {
      cursor: () => (hover ? 'pointer' : 'default'),
      click() { if (hover) location.href = `/projects/${hover.slug}` },
      frame(t, p) {
        const dt = Math.min(0.05, t - lt || 0); lt = t
        const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#163029'); g.addColorStop(1, '#0d1a17')
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = 'rgba(160,200,180,.07)'; ctx.lineWidth = 1
        for (let k = 0; k < 9; k++) { ctx.beginPath(); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, (k + 0.5) * (h / 9) + Math.sin(x * 0.02 + t * 0.5 + k) * 3); ctx.stroke() }
        hover = null
        for (const q of pads) {
          q.x += q.vx * dt; q.y += q.vy * dt; q.rot += dt * 0.03
          if (q.x < q.R || q.x > w - q.R) q.vx *= -1; if (q.y < q.R || q.y > h - q.R - 14) q.vy *= -1
          for (const o of pads) if (o !== q) { const d = near(q.x, q.y, o.x, o.y), m = q.R + o.R + 8; if (d < m && d > 0) { q.x += ((q.x - o.x) / d) * (m - d) * 0.05; q.y += ((q.y - o.y) / d) * (m - d) * 0.05 } }
          if (p.on && near(q.x, q.y, p.x, p.y) < q.R) hover = q
        }
        for (const q of pads) {
          q.open += ((q === hover ? 1 : 0) - q.open) * Math.min(1, dt * 7)
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot)
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, q.R, 0.25, TAU - 0.25); ctx.closePath()
          ctx.fillStyle = '#3c5e3b'; ctx.fill(); ctx.strokeStyle = '#6f9460'; ctx.lineWidth = 0.8; ctx.stroke()
          ctx.strokeStyle = 'rgba(160,200,130,.25)'
          for (let k = 1; k < 10; k++) { const a = 0.25 + (k / 10) * (TAU - 0.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * q.R * 0.92, Math.sin(a) * q.R * 0.92); ctx.stroke() }
          ctx.restore()
          if (q.open > 0.02) {
            for (const [n, len, col, off] of [[8, 0.62, '#f0b7c5', 0], [8, 0.42, '#fbe3e8', Math.PI / 8]] as const)
              for (let k = 0; k < n; k++) { const a = (k / n) * TAU + off + t * 0.1; dab(ctx, q.x + Math.cos(a) * q.R * len * 0.5 * q.open, q.y + Math.sin(a) * q.R * len * 0.5 * q.open, q.R * len * 0.5 * q.open, q.R * 0.13 * q.open, a, col) }
            dab(ctx, q.x, q.y, 4 * q.open, 4 * q.open, 0, '#e9c46a')
            ctx.globalAlpha = q.open; ctx.fillStyle = '#fff7f0'; ctx.font = "12px 'Geist Mono', monospace"; ctx.textAlign = 'center'
            ctx.fillText(q.title, q.x, q.y + q.R + 16); ctx.globalAlpha = 1
          }
        }
      },
    }
  },
}

/* 5 · frost night: a sky of slowly turning stars on still water, frost ferns creeping in from the edges */
const frost: PondDef = {
  id: 'frost', name: 'Frost night', tags: ['your work', 'nature'], bg: '#070c18',
  idea: 'SnapFrost’s sky on the water: stars wheel slowly, frost grows from the edges, your warmth melts it.', hint: 'hold the cursor over the frost',
  make(ctx, w, h) {
    const r = rng(17)
    const stars = Array.from({ length: 240 }, () => ({ a: r() * TAU, d: 60 + r() * Math.hypot(w, h) * 1.1, m: r() ** 3, k: r() * 50 }))
    type Seg = { x0: number; y0: number; x1: number; y1: number; b: number; m: number }
    const segs: Seg[] = []
    const grow = (x: number, y: number, a: number, len: number, depth: number, b: number) => {
      if (segs.length > 2600 || len < 2) return
      const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len
      segs.push({ x0: x, y0: y, x1, y1, b, m: 0 })
      if (depth > 6) return
      grow(x1, y1, a + (r() - 0.5) * 0.3, len * 0.88, depth + 0.5, b + len / 9)
      if (r() < 0.75) grow(x1, y1, a + 1 + r() * 0.2, len * 0.5, depth + 1, b + len / 9)
      if (r() < 0.75) grow(x1, y1, a - 1 - r() * 0.2, len * 0.5, depth + 1, b + len / 9)
    }
    for (let i = 0; i < 22; i++) {
      const side = i % 4, u = r()
      const [x, y] = side === 0 ? [u * w, h] : side === 1 ? [0, u * h] : side === 2 ? [w, u * h] : [u * w, 0]
      grow(x, y, Math.atan2(h / 2 - y, w / 2 - x) + (r() - 0.5) * 0.9, 9 + r() * 6, 0, r() * 4)
    }
    let lt = 0
    return {
      frame(t, p) {
        const dt = Math.min(0.05, t - lt || 0); lt = t
        const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1730'); g.addColorStop(1, '#050913')
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
        const px = w * 0.5, py = -h * 0.35
        for (const s of stars) {
          const a = s.a + t * 0.012, x = px + Math.cos(a) * s.d, y = py + Math.sin(a) * s.d
          if (y < 0 || y > h || x < -5 || x > w + 5) continue
          const tw = 0.4 + noise(s.k, t * 1.5) * 0.6
          ctx.fillStyle = `rgba(225,235,255,${(0.25 + s.m * 0.75) * tw})`
          ctx.fillRect(x + Math.sin(y * 0.09 + t * 1.4) * 1.8, y, 1 + s.m * 4, 1)
        }
        ctx.strokeStyle = 'rgba(200,215,255,.12)'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.45, h * 0.3, h * 0.3, 0, 0, TAU); ctx.stroke()
        const grown = t * 3
        const buckets: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
        for (const s of segs) {
          if (p.on && near((s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2, p.x, p.y) < 55) s.m = Math.min(1, s.m + dt * 4)
          else s.m = Math.max(0, s.m - dt * 0.12)
          const a = Math.min(1, Math.max(0, grown - s.b)) * (1 - s.m)
          if (a < 0.1) continue
          const k = Math.min(3, Math.floor(a * 4)); buckets[k].moveTo(s.x0, s.y0); buckets[k].lineTo(s.x1, s.y1)
        }
        ctx.lineWidth = 0.8
        buckets.forEach((b, k) => { ctx.strokeStyle = `rgba(220,235,255,${0.15 + k * 0.15})`; ctx.stroke(b) })
      },
    }
  },
}

/* 6 · ordered dither: the water lit from the top corner, drawn in two tones with a 4x4 Bayer matrix */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const dither: PondDef = {
  id: 'dither', name: 'Dithered surface', tags: ['design', '1-bit'], bg: '#1a1917',
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

/* 7 · moon on the water: a pale moon, an island of cypresses, the reflection in broken dashes */
const moon: PondDef = {
  id: 'moon', name: 'Moon on the water', tags: ['art', 'your work'], bg: '#0b0d12',
  idea: 'Complete’s mood: a moon over an island of cypresses, reflected in broken dashes that your cursor scatters.', hint: 'sweep the cursor across the reflection',
  make(ctx, w, h) {
    const hz = h * 0.45, mx = w * 0.63, my = h * 0.2, rows = Math.ceil((h - hz) / 4), sc = new Float32Array(rows)
    const r = rng(1880)
    const isle = layer(w, h), ix = isle.x
    ix.fillStyle = '#050608'
    const cx = w * 0.27
    ix.beginPath(); ix.moveTo(cx - 70, hz); ix.quadraticCurveTo(cx - 50, hz - 22, cx - 20, hz - 26); ix.lineTo(cx + 30, hz - 24); ix.quadraticCurveTo(cx + 60, hz - 16, cx + 80, hz); ix.fill()
    for (let i = 0; i < 9; i++) { const x = cx - 22 + i * 6 + (r() - 0.5) * 4, ht = 34 + r() * 34; ix.beginPath(); ix.ellipse(x, hz - 24 - ht / 2, 4 + r() * 2, ht / 2, 0, 0, TAU); ix.fill() }
    return {
      frame(t, p) {
        const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#0b0d12'); g.addColorStop(1, '#1d2129')
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, hz)
        const wg = ctx.createLinearGradient(0, hz, 0, h); wg.addColorStop(0, '#11141a'); wg.addColorStop(1, '#050608')
        ctx.fillStyle = wg; ctx.fillRect(0, hz, w, h - hz)
        const glow = ctx.createRadialGradient(mx, my, 10, mx, my, 70); glow.addColorStop(0, 'rgba(239,230,207,.22)'); glow.addColorStop(1, 'rgba(239,230,207,0)')
        ctx.fillStyle = glow; ctx.fillRect(mx - 70, my - 70, 140, 140)
        dab(ctx, mx, my, 15, 15, 0, '#efe6cf')
        ctx.drawImage(isle.c, 0, 0, w, h)
        ctx.save(); ctx.translate(0, hz * 2); ctx.scale(1, -1); ctx.globalAlpha = 0.5; ctx.drawImage(isle.c, 0, 0, w, h); ctx.restore(); ctx.globalAlpha = 1
        for (let i = 0; i < rows; i++) {
          const y = hz + 3 + i * 4, d = i / rows
          if (p.on && Math.abs(p.y - y) < 26 && Math.abs(p.x - mx) < 120) sc[i] = Math.min(60, sc[i] + 6)
          sc[i] *= 0.95
          const width = 6 + d * 60
          for (let k = 0; k < 4; k++) {
            const n = noise(k * 13.1 + i * 0.37, t * 0.4)
            const x = mx + (n - 0.5) * width * 2 + (noise(k * 7 + i, t * 3) - 0.5) * sc[i] * 2
            const len = 3 + noise(k + i * 0.7, t * 0.5) * 16
            ctx.fillStyle = `rgba(239,230,207,${(0.8 - d * 0.55) * (0.4 + n * 0.6)})`
            ctx.fillRect(x - len / 2, y, len, 1.4)
          }
        }
      },
    }
  },
}

/* 8 · ink drops: pigment blooms into wet paper, darker at the edges, and dries away */
const INKS = ['58,74,120', '176,84,54', '110,138,104', '196,150,70', '120,70,100']
const ink: PondDef = {
  id: 'ink', name: 'Ink drops', tags: ['art', 'your work'], bg: '#efe7d6',
  idea: 'Watercolour, like the project paintings. Each drop blooms with a dark rim and slowly dries away.', hint: 'click to drop ink',
  make(ctx, w, h) {
    const r = rng(3), paper = layer(w, h), px = paper.x
    px.fillStyle = '#efe7d6'; px.fillRect(0, 0, w, h)
    for (let i = 0; i < (w * h) / 40; i++) { px.fillStyle = `rgba(90,70,40,${r() * 0.05})`; px.fillRect(r() * w, r() * h, 1, 1) }
    const drops: { x: number; y: number; t0: number; R: number; c: string; s: number }[] = []
    let next = 2.5, now = 0
    const add = (x: number, y: number) => { drops.push({ x, y, t0: now, R: 30 + r() * 50, c: pick(r, INKS), s: r() * 100 }); if (drops.length > 14) drops.shift() }
    for (let i = 0; i < 4; i++) { now = -2 - i * 2; add(r() * w, r() * h) }
    now = 0
    return {
      click: (x, y) => add(x, y),
      frame(t) {
        now = t
        if (t > next) { add(r() * w, r() * h); next = t + 2.5 }
        ctx.drawImage(paper.c, 0, 0, w, h)
        ctx.globalCompositeOperation = 'multiply'
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i], age = t - d.t0
          if (age > 16) { drops.splice(i, 1); continue }
          const gr = 1 - Math.exp(-age / 1.6), fade = age > 10 ? 1 - (age - 10) / 6 : 1
          for (const [sc, fa, ed] of [[1, 0.14, 0.32], [0.82, 0.1, 0], [0.55, 0.12, 0]] as const) {
            ctx.beginPath()
            for (let k = 0; k <= 72; k++) {
              const a = (k / 72) * TAU, rad = d.R * gr * sc * (0.72 + 0.55 * noise(Math.cos(a) * 1.6 + d.s, Math.sin(a) * 1.6 + d.s + age * 0.05))
              ctx.lineTo(d.x + Math.cos(a) * rad, d.y + Math.sin(a) * rad)
            }
            ctx.fillStyle = `rgba(${d.c},${fa * fade})`; ctx.fill()
            if (ed) { ctx.strokeStyle = `rgba(${d.c},${ed * fade})`; ctx.lineWidth = 1.4; ctx.stroke() }
          }
        }
        ctx.globalCompositeOperation = 'source-over'
      },
    }
  },
}

/* 9 · fireflies over a night pond: they blink out of step at first, then fall into sync (as real ones do) */
const fireflies: PondDef = {
  id: 'fireflies', name: 'Fireflies', tags: ['nature', 'animals'], bg: '#07090a',
  idea: 'A treeline at night. The fireflies start blinking at random and slowly fall into rhythm, mirrored in the water.', hint: 'move the cursor to gather them, wait for the sync',
  make(ctx, w, h) {
    const r = rng(12), hz = h * 0.6, scene = layer(w, h), s = scene.x
    const g = s.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#07090a'); g.addColorStop(0.6, '#0e1511'); g.addColorStop(1, '#050706')
    s.fillStyle = g; s.fillRect(0, 0, w, h)
    const line = Array.from({ length: Math.ceil(w / 6) + 1 }, (_, i) => hz - 14 - fbm(i * 0.08, 2) * 46)
    for (const [dir, col] of [[1, '#030504'], [-1, '#060a08']] as const) {
      s.fillStyle = col; s.beginPath(); s.moveTo(0, hz)
      line.forEach((y, i) => s.lineTo(i * 6, hz + (y - hz) * dir * (dir < 0 ? 0.7 : 1))); s.lineTo(w, hz); s.fill()
    }
    s.strokeStyle = '#020302'; s.lineWidth = 2
    for (let i = 0; i < 26; i++) { const x = i < 13 ? r() * 70 : w - r() * 70, ht = 30 + r() * 60; s.beginPath(); s.moveTo(x, h); s.quadraticCurveTo(x + (r() - 0.5) * 20, h - ht / 2, x + (r() - 0.5) * 30, h - ht); s.stroke() }
    const glow = layer(24, 24); const gg = glow.x.createRadialGradient(12, 12, 0, 12, 12, 12)
    gg.addColorStop(0, 'rgba(230,250,150,1)'); gg.addColorStop(0.25, 'rgba(200,240,110,.5)'); gg.addColorStop(1, 'rgba(200,240,110,0)')
    glow.x.fillStyle = gg; glow.x.fillRect(0, 0, 24, 24)
    const flies = Array.from({ length: 40 }, () => ({ x: r() * w, y: h * 0.12 + r() * (hz - h * 0.2), ph: r() * TAU, k: r() * 99 }))
    let lt = 0, start = -1
    return {
      frame(t, p) {
        const dt = Math.min(0.05, t - lt || 0); lt = t; if (start < 0) start = t
        ctx.drawImage(scene.c, 0, 0, w, h)
        const K = Math.min(1.6, (t - start) * 0.05)
        let cs = 0, sn = 0
        for (const f of flies) { cs += Math.cos(f.ph); sn += Math.sin(f.ph) }
        const mean = Math.atan2(sn, cs), R = Math.hypot(cs, sn) / flies.length
        ctx.globalCompositeOperation = 'lighter'
        for (const f of flies) {
          f.ph += dt * (2.6 + K * R * Math.sin(mean - f.ph) * 2)
          if (p.on && near(f.x, f.y, p.x, p.y) < 40) f.ph += (Math.random() - 0.5) * 0.3
          const a = noise(f.x * 0.01, f.y * 0.01 + t * 0.1 + f.k * 0.01) * TAU * 2
          let vx = Math.cos(a) * 12, vy = Math.sin(a) * 8
          if (p.on && p.y < hz) { const d = near(f.x, f.y, p.x, p.y); if (d < 140 && d > 20) { vx += ((p.x - f.x) / d) * 22; vy += ((p.y - f.y) / d) * 22 } }
          f.x = (f.x + vx * dt + w) % w; f.y = Math.max(h * 0.08, Math.min(hz - 10, f.y + vy * dt))
          const b = Math.max(0, Math.cos(f.ph)) ** 8
          if (b < 0.02) continue
          ctx.globalAlpha = b; ctx.drawImage(glow.c, f.x - 12, f.y - 12, 24, 24)
          const ry = 2 * hz - f.y
          if (ry < h) { ctx.globalAlpha = b * 0.35; ctx.drawImage(glow.c, f.x - 12 + Math.sin(ry * 0.2 + t * 3) * 2, ry - 12, 24, 24) }
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
      },
    }
  },
}

/* 10 · Rothko pond: Core's colour fields, seen in water, rippling where you touch */
const rothko: PondDef = {
  id: 'rothko', name: 'Rothko, reflected', tags: ['art', 'your work'], bg: '#2a1214',
  idea: 'Core’s colour fields as a reflection: two glowing bands with soft edges, shivering when the water moves.', hint: 'move the cursor up and down',
  make(ctx, w, h) {
    const r = rng(1970), base = layer(w, h), b = base.x
    b.fillStyle = '#2a1214'; b.fillRect(0, 0, w, h)
    const band = (y0: number, y1: number, col: string) => {
      for (let k = 0; k < 16; k++) {
        const ins = k * 2.2, j = () => (r() - 0.5) * 4
        b.fillStyle = `rgba(${col},.1)`; b.fillRect(w * 0.08 + ins + j(), y0 + ins + j(), w * 0.84 - ins * 2 + j(), y1 - y0 - ins * 2 + j())
      }
    }
    band(h * 0.08, h * 0.46, '196,78,36'); band(h * 0.53, h * 0.9, '98,30,52')
    let energy = 0, py = 0
    return {
      frame(t, p) {
        if (p.on) { energy = Math.min(1, energy + Math.abs(p.y - py) * 0.01); py = p.y }
        energy *= 0.97
        for (let y = 0; y < h; y += 3) {
          const local = p.on ? Math.exp(-(((y - p.y) / 45) ** 2)) : 0
          const off = Math.sin(y * 0.045 + t * 1.2) * 1.2 + Math.sin(y * 0.22 - t * 6) * 10 * local * energy
          ctx.drawImage(base.c, 0, y * (base.c.height / h), base.c.width, 3 * (base.c.height / h), off, y, w, 3)
        }
        ctx.fillStyle = `rgba(255,170,90,${0.03 + Math.sin(t * 0.25) * 0.03})`; ctx.fillRect(0, 0, w, h)
      },
    }
  },
}

/* 11 · contours: the water as a topographic map, a stone where the cursor rests */
const contours: PondDef = {
  id: 'contours', name: 'Contour map', tags: ['design', 'maps'], bg: '#1a1917',
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

/* 12 · an engraved eye: concentric engraved ripples around an iris that follows you (in the spirit of Hillier's linework) */
const eye: PondDef = {
  id: 'eye', name: 'Engraved eye', tags: ['art', 'things you like'], bg: '#eee6d3',
  idea: 'Black-ink engraving on cream: the pond’s ripples as hatched rings around an eye that watches the cursor.', hint: 'move the cursor, click to ripple',
  make(ctx, w, h) {
    const r = rng(9), cx = w / 2, cy = h / 2
    const fibres = Array.from({ length: 150 }, (_, i) => ({ a: (i / 150) * TAU + r() * 0.03, r0: 17 + r() * 6, r1: 34 + r() * 16 }))
    const drops: number[] = []
    let now = 0, ex = 0, ey = 0, next = 2
    return {
      click: () => drops.push(now),
      frame(t, p) {
        now = t
        if (t > next) { drops.push(t); next = t + 5 }
        while (drops.length && t - drops[0] > 8) drops.shift()
        ctx.fillStyle = '#eee6d3'; ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = '#1b1813'
        const maxR = Math.hypot(w, h) / 2
        for (let R = 72; R < maxR; R += 7) {
          const pts: [number, number][] = []
          for (let k = 0; k <= 96; k++) {
            const a = (k / 96) * TAU
            let dr = Math.sin(a * 3 + t * 0.4 + R * 0.05) * 1.2
            for (const d0 of drops) { const front = (t - d0) * 55 + 60, x = R - front; dr += 6 * Math.exp(-(t - d0) / 3) * Math.sin(x * 0.18) * Math.exp(-(x * x) / 1600) }
            pts.push([cx + Math.cos(a) * (R + dr), cy + Math.sin(a) * (R + dr) * 0.78])
          }
          ctx.lineWidth = 0.6; ctx.beginPath(); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke()
          ctx.lineWidth = 1.7; ctx.beginPath()
          pts.forEach(([x, y], k) => { const a = (k / 96) * TAU, shade = Math.sin(a - 0.8); if (shade > 0.35) ctx.lineTo(x, y); else ctx.moveTo(x, y) })
          ctx.stroke()
        }
        const tx = p.on ? Math.max(-1, Math.min(1, (p.x - cx) / (w / 2))) * 12 : 0, ty = p.on ? Math.max(-1, Math.min(1, (p.y - cy) / (h / 2))) * 8 : 0
        ex += (tx - ex) * 0.12; ey += (ty - ey) * 0.12
        ctx.fillStyle = '#eee6d3'; ctx.beginPath(); ctx.ellipse(cx, cy, 66, 52, 0, 0, TAU); ctx.fill()
        ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, 66, 52, 0, 0, TAU); ctx.stroke()
        ctx.lineWidth = 0.7; ctx.beginPath()
        for (const f of fibres) { ctx.moveTo(cx + ex + Math.cos(f.a) * f.r0, cy + ey + Math.sin(f.a) * f.r0); ctx.lineTo(cx + ex * 0.6 + Math.cos(f.a) * f.r1, cy + ey * 0.6 + Math.sin(f.a) * f.r1) }
        ctx.stroke()
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx + ex * 0.6, cy + ey * 0.6, 52, 0, TAU); ctx.stroke()
        dab(ctx, cx + ex, cy + ey, 16, 16, 0, '#1b1813'); dab(ctx, cx + ex - 5, cy + ey - 6, 3.5, 3.5, 0, '#eee6d3')
      },
    }
  },
}

export const PONDS: PondDef[] = [monet, lilies, frost, fireflies, striders, moon, ink, rothko, eye, dither, contours, glyphs]
