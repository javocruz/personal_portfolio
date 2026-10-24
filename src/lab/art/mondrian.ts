/**
 * Core's Mondrian paintings, in plain Canvas 2D. Ported from the prototype generators (Mondrian v2). Built and baked,
 * but hidden on the site for now (SHOW_CORE_STYLE_SWITCH in lib/coreStyle.tsx).
 *
 * Three levels of complexity: 1 Classic (1930s), 2 Dense (late London/New York grids), 3 Boogie-Woogie (1942-43).
 * Detail passes: mottled paint, directional brushwork, charcoal pentimenti, impasto line edges, overpaint at crossings,
 * craquelure and canvas weave.
 */
import type { L } from '../../content/types'
import { DETAIL, mulberry, shade, craquelure, weave, finish, type Rand, type ProjectId } from './rothko'

export type Level = 1 | 2 | 3
export const LEVEL: Level = 2
const RED = '#c8281e', BLUE = '#1f3c8c', YEL = '#efc21a', GREY = '#b8b4aa', BLK = '#151413', BWY = '#e9c21c', WHITES = ['#f6f3ec', '#f3efe6', '#f8f6f0', '#f1ece2']

type Rect = { x: number; y: number; w: number; h: number }
type Line = { v: 0 | 1; p: number; a: number; b: number; th: number; d: number }
type Size = 'dom' | 'med' | 'small' | 'strip'
type Plan = [Size, string, ((c: Rect) => boolean)?][]

export const MONDRIAN: Record<ProjectId, { note: L; plan: Plan; leaves?: number; order?: boolean }> = {
  frost: {
    note: { en: 'Blue night dominates; one long yellow strip is the 0.21 °C the model gained; a small red counterweight.', es: 'Domina la noche azul; una tira amarilla larga son los 0.21 °C que ganó el modelo; un rojo pequeño hace contrapeso.' },
    plan: [['dom', BLUE], ['strip', YEL], ['small', RED]],
  },
  maps: {
    note: { en: 'Red fire dominates; a small red echo, never touching it, is the control room’s picture 12 steps behind.', es: 'Domina el fuego rojo; un eco rojo pequeño, que nunca lo toca, es la imagen de la sala de control 12 pasos atrás.' },
    plan: [['dom', RED], ['small', RED], ['med', YEL], ['small', BLUE]],
  },
  iris: {
    note: { en: 'Order on the left (blue), doubt on the right (red). The score falls left to right.', es: 'Orden a la izquierda (azul), duda a la derecha (rojo). La puntuación baja de izquierda a derecha.' },
    plan: [['dom', BLUE, (c) => c.x + c.w / 2 < 0.5], ['small', RED, (c) => c.x + c.w / 2 > 0.6], ['small', YEL]],
  },
  chain: {
    note: { en: 'Seven main planes, one red. Everything else in the chain is clean.', es: 'Siete planos principales, uno rojo. Todo lo demás en la cadena está limpio.' },
    plan: [['small', RED], ['med', BLUE], ['small', YEL]], leaves: 7,
  },
  // TODO(javi): real CO₂ / land / water shares, same as the Rothko.
  hills: {
    note: { en: 'Three planes for one meal: red CO₂, yellow land, blue water, sized by their shares.', es: 'Tres planos para una comida: CO₂ rojo, suelo amarillo, agua azul, del tamaño de su parte.' },
    plan: [['med', RED], ['med', YEL], ['med', BLUE]], order: true,
  },
}
const LV: Record<Level, { maxD: number; stop: number; minBig: number; th: number[]; white: number; leaves: [number, number]; sliver: number; extras: number }> = {
  1: { maxD: 4, stop: 0.28, minBig: 0.2, th: [0.011, 0.015, 0.019], white: 0.64, leaves: [6, 13], sliver: 0.045, extras: 0 },
  2: { maxD: 6, stop: 0.14, minBig: 0.11, th: [0.007, 0.01, 0.013], white: 0.58, leaves: [14, 30], sliver: 0.028, extras: 5 },
  3: { maxD: 6, stop: 0.12, minBig: 0.12, th: [0.018, 0.018, 0.018], white: 0.5, leaves: [12, 28], sliver: 0.05, extras: 6 },
}

/** The composition (where the lines and coloured planes go) and its score: higher reads more like a Mondrian. */
export function compose(R: Rand, pid: ProjectId, level: Level = LEVEL) {
  const spec = MONDRIAN[pid], cfg = LV[level], leaves: Rect[] = [], lines: Line[] = []
  const pickT = () => (R() < 0.6 ? [0.382, 0.618, 0.3, 0.7, 0.25, 0.75][Math.floor(R() * 6)] + (R() - 0.5) * 0.05 : 0.2 + R() * 0.6)
  const split = (r: Rect, d: number) => {
    const big = Math.max(r.w, r.h * 0.8)
    if (d >= cfg.maxD || big < cfg.minBig || (d > 1 && R() < cfg.stop)) { leaves.push(r); return }
    const vert = r.w * (1 + (R() - 0.5) * 0.6) > r.h * 0.8
    const t = Math.min(0.82, Math.max(0.18, pickT()))
    const th = cfg.th[Math.floor(R() * cfg.th.length)]
    if (vert) { const x = r.x + r.w * t; lines.push({ v: 1, p: x, a: r.y, b: r.y + r.h, th, d }); split({ x: r.x, y: r.y, w: x - r.x, h: r.h }, d + 1); split({ x, y: r.y, w: r.x + r.w - x, h: r.h }, d + 1) }
    else { const y = r.y + r.h * t; lines.push({ v: 0, p: y, a: r.x, b: r.x + r.w, th, d }); split({ x: r.x, y: r.y, w: r.w, h: y - r.y }, d + 1); split({ x: r.x, y, w: r.w, h: r.y + r.h - y }, d + 1) }
  }
  split({ x: 0, y: 0, w: 1, h: 1 }, 0)
  // some lines stop short of the edge
  if (level < 3) lines.forEach((l) => { if (R() < 0.22 && (l.a < 0.001 || l.b > 0.999)) { if (l.a < 0.001) l.a = 0.03 + R() * 0.05; else l.b = 0.97 - R() * 0.05 } })
  const area = (c: Rect) => c.w * c.h
  const adj = (a: Rect, b: Rect) => {
    const e = 0.002
    const touchX = Math.abs(a.x + a.w - b.x) < e || Math.abs(b.x + b.w - a.x) < e, touchY = Math.abs(a.y + a.h - b.y) < e || Math.abs(b.y + b.h - a.y) < e
    const ovY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y), ovX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
    return (touchX && ovY > e) || (touchY && ovX > e)
  }
  const col = new Map<Rect, string>()
  let fails = 0
  const scale = level === 1 ? 1 : 0.55 // denser grids have smaller planes
  const place = (size: Size, c: string, where?: (c: Rect) => boolean, soft?: boolean) => {
    const ok = leaves.filter((L) => !col.has(L) && (!where || where(L)) && ![...col].some(([o, oc]) => oc === c && adj(o, L)) && (
      size === 'dom' ? area(L) > 0.14 * scale && area(L) < 0.42
        : size === 'med' ? area(L) > 0.045 * scale && area(L) < 0.17
          : size === 'small' ? area(L) > 0.004 && area(L) < 0.06
            : Math.max(L.w / L.h, L.h / L.w) > 3 && area(L) < 0.07))
    if (!ok.length) { if (!soft) fails++; return }
    col.set(ok[Math.floor(R() * ok.length)], c)
  }
  for (const [size, c, where] of spec.plan) place(size, c, where)
  const pool = level === 3 ? [RED, BLUE, GREY, RED, BLUE] : [RED, BLUE, YEL, GREY, BLUE]
  for (let i = 0; i < cfg.extras; i++) place('small', pool[Math.floor(R() * pool.length)], undefined, true)
  // score
  let s = 1
  const white = leaves.filter((L) => !col.has(L)).reduce((a, L) => a + area(L), 0)
  s -= Math.abs(white - cfg.white) * 2.2; s -= fails * 0.5
  const n = leaves.length, want = level === 1 ? spec.leaves : undefined
  if (want) s -= Math.abs(n - want) * 0.12; else if (n < cfg.leaves[0] || n > cfg.leaves[1]) s -= 0.25
  leaves.forEach((L) => { if (Math.min(L.w, L.h) < cfg.sliver) s -= level === 1 ? 0.18 : 0.05 })
  const cm = [...col.keys()]
  if (cm.length) {
    const A = cm.reduce((a, L) => a + area(L), 0), cx = cm.reduce((a, L) => a + (L.x + L.w / 2) * area(L), 0) / A, cy = cm.reduce((a, L) => a + (L.y + L.h / 2) * area(L), 0) / A, d = Math.hypot(cx - 0.5, cy - 0.5)
    if (d < 0.06) s -= 0.2
    if (d > 0.4) s -= 0.2
  }
  if (spec.order) { const a = (c: string) => { const L = cm.find((k) => col.get(k) === c); return L ? area(L) : 0 }; if (!(a(RED) >= a(YEL) && a(YEL) >= a(BLUE))) s -= 0.3 }
  return { leaves, lines, col, score: s, level }
}

function mottle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, base: string, P: Rand, k: number) {
  for (let i = 0; i < 5 + k; i++) {
    const cx = x + P() * w, cy = y + P() * h, r = (0.25 + P() * 0.6) * Math.max(w, h)
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r), mc = shade(base, (P() - 0.5) * 8)
    g.addColorStop(0, mc); g.addColorStop(1, mc.replace(')', ' / 0)'))
    ctx.globalAlpha = k > 2 ? 0.18 + P() * 0.2 : 0.08 + P() * 0.08; ctx.fillStyle = g; ctx.fillRect(x, y, w, h)
  }
  ctx.globalAlpha = 1
}
function brushwork(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, base: string, P: Rand, W: number, H: number, coloured: boolean, density: number, flip = false, alphaScale = 1) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.lineCap = 'round'
  let vert = h > w ? P() < 0.75 : P() < 0.25
  if (flip) vert = !vert
  const n = Math.round(((w * h) / (W * H)) * (coloured ? 5200 : 2600) * density) + 30
  for (let i = 0; i < n; i++) {
    const sx = x + P() * w, sy = y + P() * h, len = (0.02 + P() * 0.08) * (vert ? H : W)
    ctx.globalAlpha = (coloured ? 0.05 + P() * 0.09 : 0.025 + P() * 0.04) * alphaScale
    ctx.strokeStyle = shade(base, coloured ? (P() - 0.5) * 16 : (P() - 0.35) * 6); ctx.lineWidth = Math.max(0.7, (0.002 + P() * 0.007) * W)
    ctx.beginPath(); ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(sx + (vert ? (P() - 0.5) * 0.004 * W : len / 2), sy + (vert ? len / 2 : (P() - 0.5) * 0.004 * H), sx + (vert ? (P() - 0.5) * 0.004 * W : len), sy + (vert ? len : (P() - 0.5) * 0.004 * H))
    ctx.stroke()
  }
  // a darker drag along the edges where the brush met the tape
  ctx.globalAlpha = (coloured ? 0.12 : 0.06) * alphaScale; ctx.strokeStyle = shade(base, coloured ? -12 : -6); ctx.lineWidth = Math.max(1, W * 0.004)
  ctx.strokeRect(x + W * 0.002, y + W * 0.002, w - W * 0.004, h - W * 0.004)
  ctx.restore(); ctx.globalAlpha = 1
}
/** Paint buildup on a plane's edge: a faint highlight on the top/left, a faint shadow on the bottom/right. */
function buildup(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, W: number) {
  const t = Math.max(0.6, W * 0.0012)
  ctx.save(); ctx.lineWidth = t
  ctx.globalAlpha = 0.1; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x + t, y + h - t); ctx.lineTo(x + t, y + t); ctx.lineTo(x + w - t, y + t); ctx.stroke()
  ctx.globalAlpha = 0.12; ctx.strokeStyle = '#000000'; ctx.beginPath(); ctx.moveTo(x + w - t, y + t); ctx.lineTo(x + w - t, y + h - t); ctx.lineTo(x + t, y + h - t); ctx.stroke()
  ctx.restore()
}

/**
 * One Mondrian, as a set of steps for the plate wrappers (plates-mondrian.ts). `R` is the prototype's composition stream
 * (`mulberry(seed * 104729 + 7 + level * 7777)`) and `P` its paint stream (`mulberry(seed * 31 + 5)`), used in the
 * prototype's order; the DETAIL passes come after the prototype's own strokes in each plane.
 */
export function mondrian(ctx: CanvasRenderingContext2D, W: number, H: number, pid: ProjectId, seed: number, level: Level = LEVEL) {
  const R = mulberry(seed * 104729 + 7 + level * 7777), comp = compose(R, pid, level), P = mulberry(seed * 31 + 5), lv = comp.level
  const density = (lv === 1 ? 1 : 1.5) * (DETAIL > 1 ? 2 : 1)

  const ground = () => { ctx.fillStyle = WHITES[0]; ctx.fillRect(0, 0, W, H) }

  const planes = () => {
    for (const L of comp.leaves) {
      const c = comp.col.get(L), base = c || WHITES[Math.floor(P() * WHITES.length)], x = L.x * W, y = L.y * H, w = L.w * W, h = L.h * H
      ctx.fillStyle = base; ctx.fillRect(x, y, w, h)
      mottle(ctx, x, y, w, h, base, P, c ? 4 : 2)
      brushwork(ctx, x, y, w, h, base, P, W, H, !!c, density)
      if (DETAIL > 1 && c) brushwork(ctx, x, y, w, h, base, P, W, H, true, density * 0.5, true, 0.45) // a second, perpendicular pass
      if (DETAIL > 1) buildup(ctx, x, y, w, h, W)
      // Boogie-Woogie: coloured planes carry a smaller plane of another colour inside
      if (lv === 3 && c && w > W * 0.06 && h > H * 0.05) {
        const ic = [RED, BLUE, BWY, '#f3efe5'].filter((k) => k !== c)[Math.floor(P() * 3)]
        const iw = w * (0.35 + P() * 0.3), ih = h * (0.35 + P() * 0.3), ix = x + (w - iw) * (0.3 + P() * 0.4), iy = y + (h - ih) * (0.3 + P() * 0.4)
        ctx.fillStyle = ic; ctx.fillRect(ix, iy, iw, ih); brushwork(ctx, ix, iy, iw, ih, ic, P, W, H, true, density)
        if (DETAIL > 1) buildup(ctx, ix, iy, iw, ih, W)
      }
    }
  }

  const pentimenti = () => {
    // charcoal ghosts of the lines he moved
    if (lv < 2) return
    ctx.save(); ctx.strokeStyle = '#4a4339'; ctx.lineWidth = Math.max(0.6, W * 0.0012)
    for (const l of comp.lines) {
      if (P() > 0.3) continue
      const o = (P() - 0.5) * 0.03
      ctx.globalAlpha = 0.1 + P() * 0.1; ctx.beginPath()
      if (l.v) { ctx.moveTo((l.p + o) * W, l.a * H); ctx.lineTo((l.p + o) * W, l.b * H) } else { ctx.moveTo(l.a * W, (l.p + o) * H); ctx.lineTo(l.b * W, (l.p + o) * H) }
      ctx.stroke()
    }
    ctx.restore()
  }

  const lines = () => {
    for (const l of comp.lines) {
      const t = l.th * W
      if (lv === 3) { // yellow lines broken by little squares of red, blue and grey
        const len = (l.b - l.a) * (l.v ? H : W), n = Math.floor(len / t)
        ctx.fillStyle = BWY
        if (l.v) ctx.fillRect(l.p * W - t / 2, l.a * H, t, len); else ctx.fillRect(l.a * W, l.p * H - t / 2, len, t)
        let i = 0
        while (i < n) {
          i += 1 + Math.floor(P() * 4)
          if (i >= n) break
          const k = P(), cc = k < 0.4 ? RED : k < 0.75 ? BLUE : GREY, u = l.a + (i * t) / (l.v ? H : W)
          ctx.fillStyle = cc
          if (l.v) ctx.fillRect(l.p * W - t / 2, u * H, t, t * (P() < 0.2 ? 2 : 1)); else ctx.fillRect(u * W, l.p * H - t / 2, t * (P() < 0.2 ? 2 : 1), t)
        }
      } else {
        ctx.fillStyle = BLK
        if (l.v) ctx.fillRect(l.p * W - t / 2, l.a * H, t, (l.b - l.a) * H); else ctx.fillRect(l.a * W, l.p * H - t / 2, (l.b - l.a) * W, t)
        // impasto: a highlight on one edge, a shadow on the other, both wobbling
        for (const [o, colr, al] of [[-t / 2, '#ffffff', 0.1], [t / 2, '#000000', 0.25], [-t / 2 + W * 0.0015, '#3b3530', 0.25]] as const) {
          ctx.strokeStyle = colr; ctx.globalAlpha = al; ctx.lineWidth = Math.max(0.6, W * 0.0014); ctx.beginPath()
          for (let s = 0; s <= 16; s++) {
            const u = l.a + ((l.b - l.a) * s) / 16, w = (P() - 0.5) * W * 0.0018
            if (l.v) { if (s) ctx.lineTo(l.p * W + o + w, u * H); else ctx.moveTo(l.p * W + o + w, u * H) } else if (s) ctx.lineTo(u * W, l.p * H + o + w); else ctx.moveTo(u * W, l.p * H + o + w)
          }
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
    }
  }

  const crossings = () => {
    // overpaint where lines cross
    if (lv >= 3) return
    for (const a of comp.lines) for (const b of comp.lines) {
      if (!a.v || b.v) continue
      if (b.p > a.a && b.p < a.b && a.p > b.a && a.p < b.b) {
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'
        const r = Math.max(a.th, b.th) * W * 0.7
        ctx.beginPath(); ctx.ellipse(a.p * W, b.p * H, r, r * 0.8, P() * 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1
      }
    }
  }

  const surface = () => { craquelure(ctx, W, H, P, lv === 1 ? 60 : 140); weave(ctx, W, H); finish(ctx, W, H, 0.06) }

  return { score: comp.score, ground, planes, pentimenti, lines, crossings, surface }
}
