import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { HOME_PONDS, setPalette } from '../lab/ponds/auto'

/**
 * The pond: one of a few self-running systems (Life, elementary automata, reaction-diffusion, Langton's ants, cyclic
 * spirals, Brian's Brain, dithered glyph rain), picked at random on each visit and never the same one twice running.
 * A small label in the corner names it and steps to the next.
 *
 * Ink on a transparent canvas over the page's own background, so it follows the theme. Anything marked
 * [data-pond-avoid] is kept clear, so the pond never runs under text. Capped at 30 fps, paused when hidden or off
 * screen; reduced motion gets a single, settled frame.
 */
const KEY = 'pond'
const NAMES: Record<string, { en: string; es: string }> = {
  life: { en: 'game of life', es: 'juego de la vida' },
  wolfram: { en: 'elementary automata', es: 'autómatas elementales' },
  turing: { en: 'reaction-diffusion', es: 'reacción-difusión' },
  ants: { en: 'langton’s ants', es: 'hormigas de langton' },
  cyclic: { en: 'cyclic spirals', es: 'espirales cíclicas' },
  brain: { en: 'brian’s brain', es: 'cerebro de brian' },
  glyphrain: { en: 'glyph rain', es: 'lluvia de glifos' },
}
const firstPick = () => {
  // ?pond=life shows a given one (handy for sharing and checking)
  const asked = HOME_PONDS.findIndex((p) => p.id === new URLSearchParams(location.search).get('pond'))
  if (asked >= 0) return asked
  let last = -1
  try { last = HOME_PONDS.findIndex((p) => p.id === localStorage.getItem(KEY)) } catch { /* storage blocked */ }
  const i = Math.floor(Math.random() * (HOME_PONDS.length - (last >= 0 ? 1 : 0)))
  return last >= 0 && i >= last ? i + 1 : i
}
const rgb = (s: string) => s.split(',').map(Number)

export function Pond({ ink = '255,247,240', accent = '224,122,63' }: { ink?: string; accent?: string }) {
  const { l } = useI18n()
  const ref = useRef<HTMLCanvasElement>(null)
  const [idx, setIdx] = useState(firstPick)
  const pond = HOME_PONDS[idx]
  useEffect(() => { try { localStorage.setItem(KEY, pond.id) } catch { /* storage blocked */ } }, [pond])
  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext('2d')!
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let inst: ReturnType<typeof pond.make> | null = null, W = 0, H = 0, raf = 0, last = 0, t0 = performance.now(), visible = true, dead = false
    let avoid: DOMRect[] = []
    const measure = () => {
      const b = canvas.getBoundingClientRect()
      avoid = [...document.querySelectorAll('[data-pond-avoid]')].map((el) => {
        const r = el.getBoundingClientRect()
        return new DOMRect(r.left - b.left - 20, r.top - b.top - 16, r.width + 40, r.height + 32)
      })
    }
    const draw = (t: number) => { inst!.frame(t, { x: 0, y: 0, on: false }); for (const r of avoid) ctx.clearRect(r.x, r.y, r.width, r.height) }
    const settle = () => { for (let k = 0; k < 48; k++) inst!.frame(k / 12, { x: 0, y: 0, on: false }); draw(4) }
    const size = () => {
      W = canvas.clientWidth; H = canvas.clientHeight
      if (!W || !H) return
      const d = Math.min(devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * d); canvas.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0)
      setPalette(rgb(ink), rgb(accent)); inst = pond.make(ctx, W, H); t0 = performance.now(); measure()
      if (still) settle()
    }
    const frame = (now: number) => {
      if (dead) return
      if (inst && now - last > 1000 / 30) { last = now; draw((now - t0) / 1000) }
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0
    }
    const wake = () => { if (!raf && !still && visible && !document.hidden) raf = requestAnimationFrame(frame) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake() })
    // text that grows (the contact form opening) or moves: keep the pond clear of it
    const watch = new ResizeObserver(() => { measure(); if (still && inst) draw(4) })
    document.querySelectorAll('[data-pond-avoid]').forEach((el) => watch.observe(el))
    const ro = new ResizeObserver(size)
    io.observe(canvas); ro.observe(canvas); size()
    addEventListener('scroll', measure, { passive: true }); addEventListener('resize', measure)
    document.addEventListener('visibilitychange', wake)
    // the text settles in after the stepped arrival: measure again once it has
    const remeasure = window.setTimeout(measure, 900)
    wake()
    return () => {
      dead = true; cancelAnimationFrame(raf); clearTimeout(remeasure); io.disconnect(); ro.disconnect(); watch.disconnect()
      removeEventListener('scroll', measure); removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [pond, ink, accent])
  return (
    <>
      <canvas ref={ref} className="pond" data-pond={pond.id} aria-hidden />
      <button className="pond-name" data-pond-avoid onClick={() => setIdx((i) => (i + 1) % HOME_PONDS.length)} title={l({ en: 'Show another pond', es: 'Ver otro estanque' })}>
        ↻ {l(NAMES[pond.id])}
      </button>
    </>
  )
}
