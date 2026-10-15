import { useEffect, useRef } from 'react'

/**
 * A thin ink line that follows the cursor and fades out behind it, like a pen lifting off paper.
 * Mouse only; does nothing for touch or reduced motion. The canvas only redraws while there is ink left.
 */
export function InkTrail({ color = '17,17,17', life = 520 }: { color?: string; life?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current!, g = c.getContext('2d')!
    const dpr = Math.min(devicePixelRatio, 2)
    const pts: { x: number; y: number; t: number }[] = []
    let raf = 0
    const size = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0) }
    const draw = () => {
      const now = performance.now()
      while (pts.length && now - pts[0].t > life) pts.shift()
      g.clearRect(0, 0, innerWidth, innerHeight)
      g.lineCap = g.lineJoin = 'round'
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], k = 1 - (now - b.t) / life
        g.strokeStyle = `rgba(${color},${(k * 0.85).toFixed(3)})`
        g.lineWidth = 0.6 + k * 2.2
        g.beginPath(); g.moveTo(a.x, a.y)
        // midpoint smoothing so the line reads as a stroke, not segments
        const n = pts[i + 1]
        if (n) g.quadraticCurveTo(b.x, b.y, (b.x + n.x) / 2, (b.y + n.y) / 2); else g.lineTo(b.x, b.y)
        g.stroke()
      }
      raf = pts.length ? requestAnimationFrame(draw) : 0
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (!raf) raf = requestAnimationFrame(draw)
    }
    size()
    addEventListener('resize', size); addEventListener('pointermove', move, { passive: true })
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', move) }
  }, [color, life])
  return <canvas ref={ref} className="ink-trail" aria-hidden />
}
