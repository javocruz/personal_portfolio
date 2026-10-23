import { useEffect, useRef } from 'react'

/**
 * A procedural "eye of nature": hair-thin rays burst from a lidded eye whose pupil follows the cursor.
 * Everything here is drawn in code (no source artwork), so it can be re-seeded, recoloured and animated.
 */
export type EyeProps = {
  rays?: number
  /** Which part of the circle the rays cover, in degrees (0 = right, 90 = down). Default: full circle. */
  arc?: [number, number]
  /** Eye width as a fraction of the shortest canvas side. */
  eyeSize?: number
  /** Centre of the burst, as fractions of width/height. */
  cx?: number
  cy?: number
  /** Ray length as a fraction of the shortest canvas side. */
  reach?: number
  palette?: 'copper' | 'gold' | 'ice'
  follow?: boolean
  seed?: number
  className?: string
}

const PALETTES = {
  copper: { inner: [150, 58, 20], mid: [226, 122, 46], tip: [255, 205, 140] },
  gold: { inner: [160, 104, 18], mid: [236, 184, 64], tip: [255, 236, 170] },
  ice: { inner: [40, 70, 150], mid: [110, 170, 230], tip: [220, 244, 255] },
} as const

function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export function EyeOfNature({ rays = 900, arc = [0, 360], eyeSize = 0.075, cx = 0.5, cy = 0.5, reach = 0.5, palette = 'copper', follow = true, seed = 7, className }: EyeProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const R = rng(seed)
    const pal = PALETTES[palette]
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const a0 = (arc[0] * Math.PI) / 180
    const a1 = (arc[1] * Math.PI) / 180

    const strands = Array.from({ length: rays }, (_, i) => {
      const t = i / rays
      const long = R() < 0.08
      return {
        a: a0 + t * (a1 - a0) + (R() - 0.5) * ((a1 - a0) / rays) * 1.4,
        r0: 1.45 + R() * 0.5, // jitter only; real root comes from the eye outline
        len: (long ? 0.85 + R() * 0.15 : 0.42 + Math.pow(R(), 0.8) * 0.45),
        bend: (R() - 0.5) * 0.06,
        w: 0.35 + R() * R() * 1.1,
        ph: R() * Math.PI * 2,
        sp: 0.4 + R() * 0.9,
        al: 0.35 + R() * 0.55,
      }
    })

    let W = 0, H = 0, dpr = 1
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1)
      const b = canvas.getBoundingClientRect()
      W = b.width; H = b.height
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // pupil target (normalised -1..1), eased
    let tx = 0, ty = 0, px = 0, py = 0
    const move = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect()
      const x = (e.clientX - (b.left + b.width * cx)) / (b.width * 0.5)
      const y = (e.clientY - (b.top + b.height * cy)) / (b.height * 0.5)
      tx = Math.max(-1, Math.min(1, x)); ty = Math.max(-1, Math.min(1, y))
    }
    if (follow) addEventListener('pointermove', move)

    let blinkAt = 2.5 + Math.random() * 3, blinkT = -1
    const click = () => { blinkT = 0 }
    canvas.addEventListener('pointerdown', click)

    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      const t = reduced ? 0 : (now - t0) / 1000
      const S = Math.min(W, H)
      const ex = W * cx, ey = H * cy
      const er = S * eyeSize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // soft halo
      const halo = ctx.createRadialGradient(ex, ey, er * 0.5, ex, ey, S * reach * 1.05)
      halo.addColorStop(0, `rgba(${pal.mid[0]},${pal.mid[1]},${pal.mid[2]},0.22)`)
      halo.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, W, H)

      // rays
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      const ptrShift = reduced ? 0 : 1
      for (const s of strands) {
        const breathe = 1 + 0.05 * Math.sin(t * s.sp + s.ph) + 0.03 * Math.sin(t * 0.7 + s.a * 3)
        const ca = Math.cos(s.a), sa = Math.sin(s.a)
        const ew = er * 1.55, eh = er * 0.78   // almond half-width / half-height
        const edge = 1 / Math.sqrt((ca / ew) ** 2 + (sa / eh) ** 2)
        const r0 = edge * (1.04 + (s.r0 - 1.45) * 0.55)
        const r1 = S * reach * s.len * breathe
        const ox = px * er * 0.18 * ptrShift, oy = py * er * 0.18 * ptrShift
        const cs = Math.cos(s.a), sn = Math.sin(s.a)
        const x0 = ex + cs * r0 + ox, y0 = ey + sn * r0 + oy
        const x1 = ex + cs * (r0 + r1), y1 = ey + sn * (r0 + r1)
        const mx = (x0 + x1) / 2 - sn * r1 * s.bend, my = (y0 + y1) / 2 + cs * r1 * s.bend
        const g = ctx.createLinearGradient(x0, y0, x1, y1)
        const a = s.al * (0.82 + 0.18 * Math.sin(t * 1.6 * s.sp + s.ph))
        g.addColorStop(0, `rgba(${pal.inner[0]},${pal.inner[1]},${pal.inner[2]},${a})`)
        g.addColorStop(0.45, `rgba(${pal.mid[0]},${pal.mid[1]},${pal.mid[2]},${a})`)
        g.addColorStop(1, `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},0)`)
        ctx.strokeStyle = g
        ctx.lineWidth = s.w
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'

      // ease pupil
      px += (tx - px) * 0.08; py += (ty - py) * 0.08

      // blink
      let open = 1
      if (!reduced) {
        if (blinkT < 0 && t > blinkAt) { blinkT = 0; blinkAt = t + 3 + Math.random() * 5 }
        if (blinkT >= 0) { blinkT += 1 / 60; const k = blinkT / 0.22; open = k < 0.5 ? 1 - k * 2 : (k - 0.5) * 2; if (k >= 1) { blinkT = -1; open = 1 } }
      }

      drawEye(ctx, ex, ey, er, open, px, py)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', move); canvas.removeEventListener('pointerdown', click) }
  }, [rays, arc, eyeSize, cx, cy, reach, palette, follow, seed])

  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true" />
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, open: number, px: number, py: number) {
  const w = r * 1.55
  const h = r * 0.66 * Math.max(0.02, open)
  const upper = (inset = 0) => {
    ctx.moveTo(x - w, y)
    ctx.bezierCurveTo(x - w * 0.55, y - h * (1.35 - inset), x + w * 0.5, y - h * (1.45 - inset), x + w, y + h * 0.05)
  }
  const lowerBack = () => ctx.bezierCurveTo(x + w * 0.5, y + h * 0.95, x - w * 0.55, y + h * 0.9, x - w, y)
  const lid = () => { ctx.beginPath(); upper(); lowerBack(); ctx.closePath() }

  ctx.save()
  // soft contact shadow, tight to the eye
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = r * 0.45
  lid(); ctx.fillStyle = '#120d0a'; ctx.fill()
  ctx.shadowBlur = 0
  lid(); ctx.clip()

  // sclera: warm at the corners, cool in the middle
  const sc = ctx.createRadialGradient(x, y, r * 0.2, x, y, w * 1.05)
  sc.addColorStop(0, '#efeae2'); sc.addColorStop(0.55, '#d9d2c6'); sc.addColorStop(1, '#8f7466')
  ctx.fillStyle = sc; ctx.fillRect(x - w, y - h * 1.6, w * 2, h * 3.2)
  // faint veins near the corners
  ctx.strokeStyle = 'rgba(170,70,60,0.18)'; ctx.lineWidth = Math.max(0.5, r * 0.012)
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 1 : -1, k = 0.55 + (i % 3) * 0.12
    ctx.beginPath(); ctx.moveTo(x + side * w * (0.98), y + (i - 3) * h * 0.08)
    ctx.quadraticCurveTo(x + side * w * k, y + (i - 3) * h * 0.2, x + side * w * (k - 0.2), y + (i - 3) * h * 0.1); ctx.stroke()
  }
  // tear duct (inner corner, left)
  const cg = ctx.createRadialGradient(x - w * 0.9, y + h * 0.1, 0, x - w * 0.9, y + h * 0.1, w * 0.24)
  cg.addColorStop(0, 'rgba(196,96,88,0.95)'); cg.addColorStop(1, 'rgba(196,96,88,0)')
  ctx.fillStyle = cg; ctx.fillRect(x - w, y - h, w * 0.5, h * 2)

  // iris (slightly larger than the opening, so the lids cut into it)
  const ir = r * 0.58
  const ix = x + px * r * 0.45, iy = y + py * r * 0.16
  const ig = ctx.createRadialGradient(ix, iy, ir * 0.1, ix, iy, ir)
  ig.addColorStop(0, '#6b5a3c'); ig.addColorStop(0.22, '#7c8a8e'); ig.addColorStop(0.62, '#5e7f94'); ig.addColorStop(0.9, '#2b4151'); ig.addColorStop(1, '#0b1218')
  ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.fillStyle = ig; ctx.fill()
  // fibres: two layers, long and short
  for (let layer = 0; layer < 2; layer++) {
    ctx.strokeStyle = layer ? 'rgba(235,242,246,0.2)' : 'rgba(8,14,20,0.35)'
    ctx.lineWidth = Math.max(0.4, r * (layer ? 0.008 : 0.012))
    const n = layer ? 70 : 52
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + layer * 0.07
      const a0 = ir * (0.3 + layer * 0.05), a1 = ir * (0.92 - layer * 0.18)
      ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * a0, iy + Math.sin(a) * a0); ctx.lineTo(ix + Math.cos(a) * a1, iy + Math.sin(a) * a1); ctx.stroke()
    }
  }
  // limbal ring + collarette
  ctx.beginPath(); ctx.arc(ix, iy, ir * 0.96, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(4,8,12,0.75)'; ctx.lineWidth = r * 0.07; ctx.stroke()
  ctx.beginPath(); ctx.arc(ix, iy, ir * 0.4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(190,150,80,0.35)'; ctx.lineWidth = r * 0.025; ctx.stroke()
  // pupil
  ctx.beginPath(); ctx.arc(ix, iy, ir * 0.33, 0, Math.PI * 2); ctx.fillStyle = '#030507'; ctx.fill()
  // catchlights
  ctx.beginPath(); ctx.ellipse(ix - ir * 0.3, iy - ir * 0.32, ir * 0.14, ir * 0.1, -0.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill()
  ctx.beginPath(); ctx.arc(ix + ir * 0.34, iy + ir * 0.4, ir * 0.05, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill()

  // lid shadow cast on the eyeball
  const sh = ctx.createLinearGradient(0, y - h * 1.3, 0, y + h)
  sh.addColorStop(0, 'rgba(0,0,0,0.78)'); sh.addColorStop(0.3, 'rgba(0,0,0,0.12)'); sh.addColorStop(0.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = sh; ctx.fillRect(x - w, y - h * 1.6, w * 2, h * 3.2)
  ctx.restore()

  ctx.save()
  // upper lash line: thick, tapering
  ctx.beginPath(); upper(); ctx.strokeStyle = '#0a0605'; ctx.lineWidth = Math.max(1.2, r * 0.07); ctx.lineCap = 'round'; ctx.stroke()
  // lower waterline
  ctx.beginPath(); ctx.moveTo(x + w, y + h * 0.05); ctx.bezierCurveTo(x + w * 0.5, y + h * 0.95, x - w * 0.55, y + h * 0.9, x - w, y)
  ctx.strokeStyle = 'rgba(40,20,14,0.85)'; ctx.lineWidth = Math.max(0.8, r * 0.03); ctx.stroke()
  // lid crease
  ctx.beginPath(); ctx.moveTo(x - w * 0.86, y - h * 0.4)
  ctx.bezierCurveTo(x - w * 0.42, y - h * 2.05, x + w * 0.4, y - h * 2.15, x + w * 0.9, y - h * 0.3)
  ctx.strokeStyle = 'rgba(214,148,84,0.6)'; ctx.lineWidth = Math.max(0.7, r * 0.022); ctx.stroke()
  // lashes
  ctx.strokeStyle = 'rgba(8,5,4,0.9)'; ctx.lineWidth = Math.max(0.6, r * 0.02)
  for (let i = 0; i < 18; i++) {
    const t = 0.1 + (i / 17) * 0.8
    const bx = x - w + t * w * 2, by = y - h * (1.0 - Math.abs(t - 0.5) * 1.1) * 1.08
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + (t - 0.4) * r * 0.22, by - r * (0.1 + 0.05 * Math.sin(i * 1.9))); ctx.stroke()
  }
  ctx.restore()
}
