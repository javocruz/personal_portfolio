import { useEffect, useRef, useState } from 'react'
import type { CoreStyle } from '../lib/coreStyle'

/**
 * Core's cursor trails, one family per style. ?trail=<id> picks one; otherwise the style's default.
 * All of them: one canvas, mouse only, nothing for touch or reduced motion, and the canvas only redraws while
 * there is something left to fade (no work while the mouse is still).
 */
export const TRAILS: Record<CoreStyle, string[]> = { mondrian: ['grid', 'blocks', 'none'], rothko: ['wash', 'glow', 'none'] }
type Pt = { x: number; y: number; t: number }
type Variant = (g: CanvasRenderingContext2D) => { move: (p: Pt) => void; draw: (now: number) => boolean }

const RED = '212,39,27', BLUE = '29,60,143', YELLOW = '242,196,12'

const variants: Record<string, Variant> = {
  // Mondrian: the line only goes across and down, snapped to an 8px grid, and ends in a small red square
  grid: (g) => {
    const life = 560, snap = (v: number) => Math.round(v / 8) * 8
    const pts: Pt[] = []
    return {
      move: (p) => {
        const x = snap(p.x), y = snap(p.y), last = pts[pts.length - 1]
        if (last && last.x === x && last.y === y) { last.t = p.t; return }
        if (last && last.x !== x && last.y !== y) pts.push({ x, y: last.y, t: p.t }) // turn the corner
        pts.push({ x, y, t: p.t })
      },
      draw: (now) => {
        while (pts.length && now - pts[0].t > life) pts.shift()
        g.lineCap = 'square'
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i], k = 1 - (now - b.t) / life
          g.strokeStyle = `rgba(17,17,17,${(k * 0.9).toFixed(3)})`; g.lineWidth = 1 + k * 2
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke()
        }
        const h = pts[pts.length - 1]
        if (h) { const k = 1 - (now - h.t) / life; g.fillStyle = `rgba(${RED},${k.toFixed(3)})`; g.fillRect(h.x - 4, h.y - 4, 8, 8) }
        return pts.length > 0
      },
    }
  },
  // Mondrian: faint 48px cells fill in under the cursor with a primary, then fade
  blocks: (g) => {
    const life = 900, S = 48, cols = [RED, BLUE, YELLOW]
    const cells = new Map<string, { x: number; y: number; t: number; c: string }>()
    return {
      move: (p) => {
        const x = Math.floor(p.x / S) * S, y = Math.floor(p.y / S) * S, key = `${x},${y}`
        const old = cells.get(key)
        if (old && p.t - old.t < life * 0.6) return
        cells.set(key, { x, y, t: p.t, c: cols[Math.abs((x / S) * 7 + (y / S) * 13) % 3] })
      },
      draw: (now) => {
        for (const [k, c] of cells) {
          const a = 1 - (now - c.t) / life
          if (a <= 0) { cells.delete(k); continue }
          g.fillStyle = `rgba(${c.c},${(a * 0.32).toFixed(3)})`; g.fillRect(c.x + 1, c.y + 1, S - 2, S - 2)
          g.strokeStyle = `rgba(17,17,17,${(a * 0.18).toFixed(3)})`; g.lineWidth = 1; g.strokeRect(c.x + 0.5, c.y + 0.5, S - 1, S - 1)
        }
        return cells.size > 0
      },
    }
  },
  // Rothko: a wide, low wash of orange that spreads and fades
  wash: (g) => {
    const life = 900
    const pts: Pt[] = []
    return {
      move: (p) => { const l = pts[pts.length - 1]; if (!l || Math.hypot(p.x - l.x, p.y - l.y) > 6) pts.push(p) },
      draw: (now) => {
        while (pts.length && now - pts[0].t > life) pts.shift()
        for (const p of pts) {
          const k = 1 - (now - p.t) / life, r = 18 + (1 - k) * 26
          const grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
          grd.addColorStop(0, `rgba(224,102,42,${(k * 0.07).toFixed(3)})`); grd.addColorStop(1, 'rgba(224,102,42,0)')
          g.fillStyle = grd; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill()
        }
        return pts.length > 0
      },
    }
  },
  // Rothko: a big, slow halo, maroon into orange, that lags behind the cursor and settles when you stop
  glow: (g) => {
    let tx = -1, ty = -1, x = -1, y = -1, last = 0
    return {
      move: (p) => { if (x < 0) { x = p.x; y = p.y }; tx = p.x; ty = p.y; last = p.t },
      draw: (now) => {
        if (x < 0) return false
        x += (tx - x) * 0.07; y += (ty - y) * 0.07
        const idle = now - last, k = Math.max(0, 1 - Math.max(0, idle - 400) / 900), r = 110
        const grd = g.createRadialGradient(x, y, 0, x, y, r)
        grd.addColorStop(0, `rgba(224,102,42,${(k * 0.16).toFixed(3)})`)
        grd.addColorStop(0.55, `rgba(122,31,26,${(k * 0.08).toFixed(3)})`)
        grd.addColorStop(1, 'rgba(122,31,26,0)')
        g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill()
        return k > 0
      },
    }
  },
}

const fromUrl = () => { try { return new URLSearchParams(location.search).get('trail') } catch { return null } }

export function CursorTrail({ style }: { style: CoreStyle }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [pick, setPick] = useState<string | null>(fromUrl)
  const id = pick && TRAILS[style].includes(pick) ? pick : TRAILS[style][0]
  useEffect(() => {
    if (id === 'none' || !variants[id]) return
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current!, g = c.getContext('2d')!
    const dpr = Math.min(devicePixelRatio, 2)
    const v = variants[id](g)
    let raf = 0
    const size = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0) }
    const draw = () => {
      g.clearRect(0, 0, innerWidth, innerHeight)
      raf = v.draw(performance.now()) ? requestAnimationFrame(draw) : 0
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      v.move({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (!raf) raf = requestAnimationFrame(draw)
    }
    size()
    addEventListener('resize', size); addEventListener('pointermove', move, { passive: true })
    return () => { cancelAnimationFrame(raf); g.clearRect(0, 0, innerWidth, innerHeight); removeEventListener('resize', size); removeEventListener('pointermove', move) }
  }, [id])
  return (
    <>
      <canvas ref={ref} className="ink-trail" aria-hidden />
      {import.meta.env.DEV && (
        <label className="trail-picker">
          trail{' '}
          <select value={id} onChange={(e) => setPick(e.target.value)}>
            {TRAILS[style].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      )}
    </>
  )
}
