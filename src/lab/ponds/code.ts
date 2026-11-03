import { rng, type Pointer, type PondDef } from './kit'

/**
 * Ponds in the site's own voice: ink on the dark ground, monospace, one accent used sparingly. They all read the same
 * water: a few slow travelling waves plus rings from the cursor, from clicks and from the odd raindrop.
 */
const BG = '#1a1917', INK = '255,247,240', ACC = '224,122,63'
const MONO = "'Geist Mono', ui-monospace, monospace"

const water = () => {
  const rings: { x: number; y: number; t0: number; s: number }[] = []
  let last = 0, now = 0
  return {
    tick(t: number, p: Pointer, every = 0.18) {
      now = t
      for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t0 > 4) rings.splice(i, 1)
      if (Math.random() < 0.008) rings.push({ x: Math.random() * 2000, y: Math.random() * 1200, t0: t, s: 0.8 })
      if (p.on && t - last > every) { rings.push({ x: p.x, y: p.y, t0: t, s: 0.6 }); last = t }
      if (rings.length > 30) rings.shift()
    },
    drop(x: number, y: number) { rings.push({ x, y, t0: now, s: 1.2 }) },
    /** surface height, roughly -1.5..1.5, and how much of it is ring (0..1) */
    at(x: number, y: number, t: number) {
      let v = Math.sin(x * 0.012 + t * 0.5) * 0.5 + Math.sin(y * 0.017 - t * 0.4 + x * 0.004) * 0.4 + Math.sin((x - y) * 0.008 + t * 0.3) * 0.6
      let ring = 0
      for (const g of rings) {
        const age = t - g.t0, d = Math.hypot(x - g.x, y - g.y) - age * 110
        if (d < -70 || d > 70) continue
        const k = Math.exp(-(d * d) / 500) * (1 - age / 4) * g.s
        v += Math.cos(d * 0.12) * k * 1.6; ring = Math.max(ring, k)
      }
      return [v, ring] as const
    },
  }
}
const clear = (ctx: CanvasRenderingContext2D, w: number, h: number) => { ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h) }

/* halftone: a regular grid of dots, each sized by the height of the water under it */
const halftone: PondDef = {
  id: 'halftone', name: 'Halftone', tags: ['print', 'grid'], bg: BG,
  idea: 'A fixed grid of dots, each one sized by the water beneath it, like a newspaper photo of a pond.', hint: 'move, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), G = 11
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p); clear(ctx, w, h)
        const ink = new Path2D(), hot = new Path2D()
        for (let y = G / 2; y < h; y += G) for (let x = G / 2; x < w; x += G) {
          const [v, r] = W.at(x, y, t), rad = Math.max(0.5, Math.min(G * 0.48, (v + 1.6) * 1.6))
          const path = r > 0.55 ? hot : ink
          path.moveTo(x + rad, y); path.arc(x, y, rad, 0, Math.PI * 2)
        }
        ctx.fillStyle = `rgba(${INK},.8)`; ctx.fill(ink); ctx.fillStyle = `rgb(${ACC})`; ctx.fill(hot)
      },
    }
  },
}

/* quiver: the slope of the water as a field of little arrows, like a plot of a vector field */
const quiver: PondDef = {
  id: 'quiver', name: 'Vector field', tags: ['math', 'plot'], bg: BG,
  idea: 'The slope of the water as a quiver plot: a dash per point, pointing downhill, longer where it’s steeper.', hint: 'move, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), G = 16
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p); clear(ctx, w, h)
        const lines: Path2D[] = [new Path2D(), new Path2D(), new Path2D()], hot = new Path2D()
        for (let y = G / 2; y < h; y += G) for (let x = G / 2; x < w; x += G) {
          const [v, r] = W.at(x, y, t), gx = W.at(x + 2, y, t)[0] - v, gy = W.at(x, y + 2, t)[0] - v
          const m = Math.hypot(gx, gy), len = Math.min(G * 0.9, 3 + m * 160), a = Math.atan2(-gy, -gx)
          const path = r > 0.5 ? hot : lines[Math.min(2, Math.floor(m * 30))]
          const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2
          path.moveTo(x - dx, y - dy); path.lineTo(x + dx, y + dy)
          path.moveTo(x + dx + 1, y + dy); path.arc(x + dx, y + dy, 1, 0, Math.PI * 2)
        }
        ctx.lineWidth = 1
        lines.forEach((l, k) => { ctx.strokeStyle = `rgba(${INK},${0.25 + k * 0.25})`; ctx.stroke(l) })
        ctx.strokeStyle = `rgb(${ACC})`; ctx.stroke(hot)
      },
    }
  },
}

/* ridgelines: horizontal lines lifted by the water, each hiding the ones behind it */
const ridges: PondDef = {
  id: 'ridges', name: 'Ridgelines', tags: ['plot', 'lines'], bg: BG,
  idea: 'The surface sliced into horizontal lines, each lifted by the water and hiding the ones behind it.', hint: 'move, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), STEP = 9, DX = 6
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p); clear(ctx, w, h)
        for (let y0 = STEP * 2; y0 < h + 20; y0 += STEP) {
          const pts: number[] = []
          let hot = false
          for (let x = 0; x <= w + DX; x += DX) {
            const [v, r] = W.at(x, y0, t), env = Math.sin((x / w) * Math.PI) ** 0.6
            pts.push(y0 - (v + 1.5) * 13 * env - r * 14); if (r > 0.5) hot = true
          }
          ctx.beginPath(); ctx.moveTo(0, h)
          pts.forEach((y, i) => ctx.lineTo(i * DX, y)); ctx.lineTo(w, h); ctx.closePath()
          ctx.fillStyle = BG; ctx.fill()
          ctx.beginPath(); pts.forEach((y, i) => ctx.lineTo(i * DX, y))
          ctx.strokeStyle = hot ? `rgba(${ACC},.95)` : `rgba(${INK},.7)`; ctx.lineWidth = 1; ctx.stroke()
        }
      },
    }
  },
}

/* braille: the water rendered in braille characters, eight dots per letter, as terminals draw graphs */
const BRAILLE_BITS = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]]
const BRAILLE_T = [[0.1, 0.6], [0.85, 0.35], [0.3, 0.8], [0.55, 0.05]]
const braille: PondDef = {
  id: 'braille', name: 'Braille terminal', tags: ['terminal', 'type'], bg: BG,
  idea: 'Drawn the way terminal tools draw charts: braille characters, eight dots each, typed row by row.', hint: 'move, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), FS = 12
    ctx.font = `${FS}px ${MONO}`
    const cw = ctx.measureText('⣿').width || 7, lh = FS * 1.15
    const cols = Math.ceil(w / cw), rows = Math.ceil(h / lh)
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p); clear(ctx, w, h)
        ctx.font = `${FS}px ${MONO}`; ctx.textBaseline = 'top'
        for (let j = 0; j < rows; j++) {
          let line = '', hotLine = ''
          for (let i = 0; i < cols; i++) {
            let bits = 0, hot = false
            for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 2; sx++) {
              const [v, r] = W.at(i * cw + (sx + 0.5) * (cw / 2), j * lh + (sy + 0.5) * (lh / 4), t)
              if ((v + 1.5) / 3 > 0.26 + BRAILLE_T[sy][sx] * 0.36) bits |= BRAILLE_BITS[sy][sx]
              if (r > 0.6) hot = true
            }
            const ch = String.fromCharCode(0x2800 + bits)
            line += hot ? '⠀' : ch; hotLine += hot ? ch : '⠀'
          }
          ctx.fillStyle = `rgba(${INK},.72)`; ctx.fillText(line, 0, j * lh)
          ctx.fillStyle = `rgb(${ACC})`; ctx.fillText(hotLine, 0, j * lh)
        }
      },
    }
  },
}

/* hex dump: the pond as memory, one byte per cell, brighter where the water is higher */
const hex: PondDef = {
  id: 'hex', name: 'Hex dump', tags: ['terminal', 'data'], bg: BG,
  idea: 'The pond as a block of memory: addresses down the side, one byte per cell, brighter where the water is high.', hint: 'move, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), FS = 11, lh = 16, cell = 21, left = 64
    const cols = Math.floor((w - left - 8) / cell), rows = Math.ceil(h / lh)
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p, 0.12); clear(ctx, w, h)
        ctx.font = `${FS}px ${MONO}`; ctx.textBaseline = 'middle'
        for (let j = 0; j < rows; j++) {
          const y = j * lh + lh / 2
          ctx.fillStyle = `rgba(${INK},.22)`; ctx.fillText('0x' + (j * cols).toString(16).padStart(4, '0'), 8, y)
          for (let i = 0; i < cols; i++) {
            const x = left + i * cell, [v, r] = W.at(x + 6, y, t), b = Math.max(0, Math.min(255, Math.round(((v + 1.5) / 3) * 255)))
            ctx.fillStyle = r > 0.5 ? `rgb(${ACC})` : `rgba(${INK},${0.08 + (b / 255) ** 2 * 0.85})`
            ctx.fillText(b.toString(16).padStart(2, '0'), x, y)
          }
        }
      },
    }
  },
}

/* wireframe: the surface as a mesh seen in perspective, the cursor's rings travelling across it */
const wire: PondDef = {
  id: 'wire', name: 'Wireframe', tags: ['3d', 'lines'], bg: BG,
  idea: 'The water as a 3D mesh in perspective, like an old CAD render; rings roll toward you across it.', hint: 'move over the mesh, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), NX = 44, NZ = 26, hz = h * 0.18, f = h * 0.9, cam = 1.1
    const proj = (X: number, Z: number, y: number) => [w / 2 + (X * f) / Z, hz + ((cam - y) * f) / Z] as const
    // grid in world space: X from -2.4..2.4, Z from 1..6; water coords stretch that over 1000x800
    const wx = (X: number) => (X + 2.4) * 210, wz = (Z: number) => (Z - 1) * 160
    return {
      click(x, y) { const Z = (cam * f) / Math.max(1, y - hz); W.drop(wx(((x - w / 2) * Z) / f), wz(Z)) },
      frame(t, p) {
        const q = { ...p }
        if (p.on && p.y > hz + 4) { const Z = (cam * f) / (p.y - hz); q.x = wx(((p.x - w / 2) * Z) / f); q.y = wz(Z) } else q.on = false
        W.tick(t, q, 0.25); clear(ctx, w, h)
        const P: (readonly [number, number])[][] = [], R: number[][] = []
        for (let k = 0; k < NZ; k++) {
          const Z = 6 - (k / (NZ - 1)) * 5; P.push([]); R.push([])
          for (let i = 0; i < NX; i++) { const X = -2.4 + (i / (NX - 1)) * 4.8, [v, r] = W.at(wx(X), wz(Z), t); P[k].push(proj(X, Z, v * 0.12)); R[k].push(r) }
        }
        for (let k = 0; k < NZ; k++) {
          const a = 0.12 + (k / NZ) * 0.6
          ctx.strokeStyle = `rgba(${INK},${a})`; ctx.lineWidth = 0.8
          ctx.beginPath(); P[k].forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke()
          if (k > 0) { ctx.beginPath(); for (let i = 0; i < NX; i += 1) { ctx.moveTo(...P[k - 1][i]); ctx.lineTo(...P[k][i]) } ctx.stroke() }
          ctx.fillStyle = `rgb(${ACC})`
          for (let i = 0; i < NX; i++) if (R[k][i] > 0.55) ctx.fillRect(P[k][i][0] - 1, P[k][i][1] - 1, 2, 2)
        }
      },
    }
  },
}

/* registration marks: a grid of plus signs that turn and swell with the water, and cross where it peaks */
const marks: PondDef = {
  id: 'marks', name: 'Registration marks', tags: ['print', 'grid'], bg: BG,
  idea: 'A blueprint grid of plus signs that turn and swell as the water moves under them; peaks flip to ×.', hint: 'move, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), G = 20
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p); clear(ctx, w, h)
        const lo = new Path2D(), hi = new Path2D(), hot = new Path2D()
        for (let y = G / 2; y < h; y += G) for (let x = G / 2; x < w; x += G) {
          const [v, r] = W.at(x, y, t), a = Math.max(0, Math.min(1, (v + 0.6) / 1.8)) * (Math.PI / 4), s = 2 + Math.max(0, v + 1.5) * 1.6
          const path = r > 0.5 ? hot : v > 0.6 ? hi : lo
          for (const k of [0, Math.PI / 2]) {
            const c = Math.cos(a + k) * s, d = Math.sin(a + k) * s
            path.moveTo(x - c, y - d); path.lineTo(x + c, y + d)
          }
        }
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(${INK},.3)`; ctx.stroke(lo)
        ctx.strokeStyle = `rgba(${INK},.85)`; ctx.stroke(hi)
        ctx.strokeStyle = `rgb(${ACC})`; ctx.stroke(hot)
      },
    }
  },
}

/* nodes: points afloat on the water, linked when close, like a network drawing itself */
const nodes: PondDef = {
  id: 'nodes', name: 'Network', tags: ['graph', 'data'], bg: BG,
  idea: 'Points floating on the current, linked when they drift close, like a graph laying itself out. The cursor is a node too.', hint: 'move through it, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), r = rng(5), N = Math.round((w * h) / 3600), LINK = 64
    const pts = Array.from({ length: N }, () => ({ x: r() * w, y: r() * h }))
    let lt = 0
    return {
      click: W.drop,
      frame(t, p) {
        const dt = Math.min(0.05, t - lt || 0); lt = t
        W.tick(t, p, 0.4); clear(ctx, w, h)
        for (const q of pts) {
          const [v] = W.at(q.x, q.y, t), gx = W.at(q.x + 3, q.y, t)[0] - v, gy = W.at(q.x, q.y + 3, t)[0] - v
          q.x += (-gx * 900 + 4) * dt; q.y += -gy * 900 * dt
          q.x = (q.x + w) % w; q.y = (q.y + h) % h
        }
        const lines = [new Path2D(), new Path2D(), new Path2D()]
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < LINK) { const k = Math.min(2, Math.floor((1 - d / LINK) * 3)); lines[k].moveTo(pts[i].x, pts[i].y); lines[k].lineTo(pts[j].x, pts[j].y) }
        }
        ctx.lineWidth = 0.8
        lines.forEach((l, k) => { ctx.strokeStyle = `rgba(${INK},${0.08 + k * 0.14})`; ctx.stroke(l) })
        ctx.fillStyle = `rgba(${INK},.8)`
        for (const q of pts) ctx.fillRect(q.x - 1, q.y - 1, 2, 2)
        if (p.on) {
          ctx.strokeStyle = `rgba(${ACC},.85)`; ctx.beginPath()
          for (const q of pts) if (Math.hypot(q.x - p.x, q.y - p.y) < LINK * 1.6) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y) }
          ctx.stroke(); ctx.fillStyle = `rgb(${ACC})`; ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
        }
      },
    }
  },
}

/* oscilloscope: a few traces sampled across the pond, a graticule, and a probe that reads the value under the cursor */
const scope: PondDef = {
  id: 'scope', name: 'Oscilloscope', tags: ['signal', 'instrument'], bg: BG,
  idea: 'Five traces sampled across the water on a graticule, with a probe that reads out the value under your cursor.', hint: 'move to probe, click to drop a stone',
  make(ctx, w, h) {
    const W = water(), TR = 5
    return {
      click: W.drop,
      frame(t, p) {
        W.tick(t, p, 0.3); clear(ctx, w, h)
        ctx.strokeStyle = `rgba(${INK},.08)`; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath()
        for (let x = 0; x <= w; x += w / 10) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, h) }
        for (let y = 0; y <= h; y += h / 6) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(w, Math.round(y) + 0.5) }
        ctx.stroke(); ctx.setLineDash([])
        for (let k = 0; k < TR; k++) {
          const y0 = ((k + 1) / (TR + 1)) * h
          ctx.beginPath()
          let hot = false
          for (let x = 0; x <= w; x += 3) { const [v, r] = W.at(x, y0, t); ctx.lineTo(x, y0 - v * 12 - r * 14); if (r > 0.5) hot = true }
          ctx.strokeStyle = hot ? `rgb(${ACC})` : `rgba(${INK},${k === 2 ? 0.9 : 0.45})`; ctx.lineWidth = k === 2 ? 1.3 : 1; ctx.stroke()
        }
        ctx.font = `10px ${MONO}`; ctx.fillStyle = `rgba(${INK},.45)`; ctx.textBaseline = 'top'
        ctx.fillText(`t ${t.toFixed(2)}s   ch ${TR}   0.5 hz/div`, 10, 8)
        if (p.on) {
          const [v] = W.at(p.x, p.y, t)
          ctx.strokeStyle = `rgba(${ACC},.7)`; ctx.beginPath(); ctx.moveTo(Math.round(p.x) + 0.5, 0); ctx.lineTo(Math.round(p.x) + 0.5, h); ctx.stroke()
          ctx.fillStyle = `rgb(${ACC})`; ctx.fillText(`x ${Math.round(p.x)}  y ${Math.round(p.y)}  h ${v >= 0 ? '+' : ''}${v.toFixed(3)}`, Math.min(p.x + 8, w - 170), Math.max(8, p.y - 18))
        }
      },
    }
  },
}

export const CODE_PONDS: PondDef[] = [halftone, quiver, ridges, braille, hex, wire, marks, nodes, scope]
