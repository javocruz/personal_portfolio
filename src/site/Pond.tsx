import { useEffect, useRef } from 'react'

/**
 * The pond (a placeholder until the real one is designed): still water drawn as a grid of monospace glyphs. Slow
 * ripples move across it, a raindrop lands now and then, and the cursor leaves rings as it moves. Anything marked
 * [data-pond-avoid] stays clear, so the water never runs over text.
 *
 * Plain Canvas 2D with a pre-drawn glyph atlas (one drawImage per lit cell). Capped at 30 fps, paused when the tab is
 * hidden or the canvas is off screen, and a single still frame for reduced motion.
 */
const RAMP = ['·', '.', ':', '-', '=', '+', '*', '#']
const CELL = 16 // css px per cell

type Ring = { x: number; y: number; t0: number; strength: number }

export function Pond({ ink = '255,247,240', accent = '224,122,63' }: { ink?: string; accent?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext('2d')!
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(devicePixelRatio || 1, 2)
    let W = 0, H = 0, cols = 0, rows = 0, raf = 0, last = 0, visible = true, dead = false
    let avoid: DOMRect[] = []
    const rings: Ring[] = []
    // glyph atlas: each glyph at 4 tones, in ink; the brightest tone of the top glyphs also in the accent
    const TONES = [0.16, 0.3, 0.5, 0.78]
    const atlas = document.createElement('canvas')
    const glyph = (g: number, tone: number, hot: boolean) => [g * CELL * dpr, (hot ? TONES.length : tone) * CELL * dpr] as const
    const buildAtlas = () => {
      atlas.width = RAMP.length * CELL * dpr; atlas.height = (TONES.length + 1) * CELL * dpr
      const a = atlas.getContext('2d')!
      a.clearRect(0, 0, atlas.width, atlas.height)
      a.font = `${11 * dpr}px 'Geist Mono', ui-monospace, monospace`; a.textAlign = 'center'; a.textBaseline = 'middle'
      RAMP.forEach((ch, g) => {
        TONES.forEach((tn, k) => { a.fillStyle = `rgba(${ink},${tn})`; a.fillText(ch, (g + 0.5) * CELL * dpr, (k + 0.5) * CELL * dpr) })
        a.fillStyle = `rgba(${accent},0.9)`; a.fillText(ch, (g + 0.5) * CELL * dpr, (TONES.length + 0.5) * CELL * dpr)
      })
    }
    const size = () => {
      W = canvas.clientWidth; H = canvas.clientHeight
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL)
      measure()
    }
    const measure = () => {
      const b = canvas.getBoundingClientRect()
      avoid = [...document.querySelectorAll('[data-pond-avoid]')].map((el) => {
        const r = el.getBoundingClientRect()
        return new DOMRect(r.left - b.left - 18, r.top - b.top - 14, r.width + 36, r.height + 28)
      })
    }
    const blocked = (x: number, y: number) => avoid.some((r) => x > r.left && x < r.right && y > r.top && y < r.bottom)

    // a slow interference of a few travelling waves: the still surface of the water
    const surface = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 0.011 + t * 0.35) * Math.cos(y * 0.013 - t * 0.27)
      const b = Math.sin((x + y) * 0.007 - t * 0.21 + Math.sin(y * 0.004 + t * 0.1) * 2)
      const c = Math.sin(Math.hypot(x - W * 0.7, y - H * 0.35) * 0.018 - t * 0.6)
      return (a * 0.45 + b * 0.35 + c * 0.2) * 0.5 + 0.5
    }
    const ring = (x: number, y: number, t: number) => {
      let v = 0
      for (const r of rings) {
        const age = t - r.t0, rad = age * 120, d = Math.hypot(x - r.x, y - r.y)
        const band = Math.exp(-((d - rad) ** 2) / 220) * Math.max(0, 1 - age / 3.2) * r.strength
        v = Math.max(v, band)
      }
      return v
    }
    const draw = (now: number) => {
      const t = now / 1000
      for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t0 > 3.2) rings.splice(i, 1)
      if (!still && Math.random() < 0.012) rings.push({ x: Math.random() * W, y: Math.random() * H, t0: t, strength: 0.7 + Math.random() * 0.3 })
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = (i + 0.5) * CELL, y = (j + 0.5) * CELL
        if (blocked(x, y)) continue
        const s = surface(x, y, t), r = ring(x, y, t)
        const v = Math.max(s * s * 0.62, r)
        if (v < 0.22) continue
        const g = Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))
        const hot = r > 0.82
        const tone = Math.min(TONES.length - 1, Math.floor((v - 0.22) / 0.78 * TONES.length))
        const [sx, sy] = glyph(g, tone, hot)
        ctx.drawImage(atlas, sx, sy, CELL * dpr, CELL * dpr, i * CELL * dpr, j * CELL * dpr, CELL * dpr, CELL * dpr)
      }
    }
    const frame = (now: number) => {
      if (dead) return
      if (now - last > 1000 / 30) { last = now; draw(now) }
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0
    }
    const wake = () => { if (!raf && !still && visible && !document.hidden) raf = requestAnimationFrame(frame) }
    let lastRing = 0
    const move = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect(), t = performance.now() / 1000
      if (t - lastRing < 0.12) return
      lastRing = t
      rings.push({ x: e.clientX - b.left, y: e.clientY - b.top, t0: t, strength: 0.55 })
      if (rings.length > 24) rings.shift()
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake() })
    // text that grows (the contact form opening) or moves: keep the water clear of it
    const watch = new ResizeObserver(() => { measure(); if (still) draw(performance.now()) })
    document.querySelectorAll('[data-pond-avoid]').forEach((el) => watch.observe(el))
    const ro = new ResizeObserver(() => { size(); if (still) draw(performance.now()) })
    const onVis = () => wake()
    document.fonts?.ready.then(() => { if (!dead) { buildAtlas(); draw(performance.now()) } })
    buildAtlas(); size()
    io.observe(canvas); ro.observe(canvas)
    addEventListener('pointermove', move, { passive: true }); addEventListener('scroll', measure, { passive: true }); addEventListener('resize', measure)
    document.addEventListener('visibilitychange', onVis)
    // the text settles in after the stepped arrival: measure again once it has
    const remeasure = window.setTimeout(measure, 900)
    if (still) draw(performance.now()); else wake()
    return () => {
      dead = true; cancelAnimationFrame(raf); clearTimeout(remeasure); io.disconnect(); ro.disconnect(); watch.disconnect()
      removeEventListener('pointermove', move); removeEventListener('scroll', measure); removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ink, accent])
  return <canvas ref={ref} className="pond" aria-hidden />
}
