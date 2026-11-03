import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PONDS } from './ponds/defs'
import { DPR, type PondDef, type Pointer } from './ponds/kit'
import './ponds/ponds.css'

/**
 * The pond testing room: twelve small, live candidates for the site's home-page water, side by side. Each runs only
 * while it is on screen, at 30 fps, and responds to the cursor (and to clicks, where its hint says so).
 */
function Tank({ pond }: { pond: PondDef }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext('2d')!
    const p: Pointer = { x: 0, y: 0, on: false }
    let inst: ReturnType<PondDef['make']> | null = null, raf = 0, last = 0, visible = false, t0 = performance.now()
    const size = () => {
      const w = c.clientWidth, h = c.clientHeight, d = DPR()
      c.width = Math.round(w * d); c.height = Math.round(h * d)
      ctx.setTransform(d, 0, 0, d, 0, 0)
      inst = pond.make(ctx, w, h); t0 = performance.now()
    }
    const frame = (now: number) => {
      if (now - last > 1000 / 30 && inst) { last = now; inst.frame((now - t0) / 1000, p); c.style.cursor = inst.cursor?.() ?? 'crosshair' }
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const pos = (e: PointerEvent) => { const b = c.getBoundingClientRect(); p.x = e.clientX - b.left; p.y = e.clientY - b.top }
    const move = (e: PointerEvent) => { pos(e); p.on = true }
    const leave = () => { p.on = false }
    const down = (e: PointerEvent) => { pos(e); p.on = true; inst?.click?.(p.x, p.y) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame) })
    const ro = new ResizeObserver(size)
    ro.observe(c); io.observe(c)
    c.addEventListener('pointermove', move); c.addEventListener('pointerleave', leave); c.addEventListener('pointerdown', down)
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
      c.removeEventListener('pointermove', move); c.removeEventListener('pointerleave', leave); c.removeEventListener('pointerdown', down)
    }
  }, [pond])
  return <canvas ref={ref} className="tank-canvas" style={{ background: pond.bg }} />
}

export default function Ponds() {
  return (
    <main className="ponds">
      <header className="ponds-head">
        <Link to="/">← site</Link>
        <h1>pond testing room</h1>
        <p>Round two, in the site’s own voice: ink on dark, monospace, one accent. Nine new ones, then the three you liked from round one. Each is live: move over it, click to drop a stone.</p>
      </header>
      <div className="ponds-grid">
        {PONDS.map((p, i) => (
          <article key={p.id} className="tank">
            <Tank pond={p} />
            <div className="tank-label">
              <p className="tank-title"><span>{String(i + 1).padStart(2, '0')}</span> <b>{p.name}</b></p>
              <p className="tank-tags">{p.tags.join(' · ')}</p>
              <p className="tank-idea">{p.idea}</p>
              <p className="tank-hint">↳ {p.hint}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
