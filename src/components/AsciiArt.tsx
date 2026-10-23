import { useEffect, useRef, useState } from 'react'

const RAMP = ' .:-=+*#%@'

/**
 * Draws an image as coloured ASCII on a 2D canvas (no WebGL). With `reveal`, the characters settle into the real
 * image cell by cell when it scrolls into view, and hovering turns it back into text.
 */
export function AsciiArt({ src, alt, cols = 96, reveal = false, paper = false, tint, className = '' }: {
  src: string; alt: string; cols?: number; reveal?: boolean
  /** light-paper image: leave the paper blank and draw the strokes, darkest densest */
  paper?: boolean
  tint?: (l: number) => string; className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ratio, setRatio] = useState(1.25)
  const hover = useRef(false)
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!
    const img = new Image(); img.src = src
    let raf = 0, p = 0, target = 0, dead = false
    const undo: (() => void)[] = []
    img.onload = () => {
      if (dead) return
      setRatio(img.height / img.width)
      const cw = Math.max(4, Math.round(c.clientWidth / cols)), rows = Math.round((img.height / img.width) * cols * 0.9)
      const W = cols * cw, H = Math.round(W * img.height / img.width), ch = H / rows
      const dpr = Math.min(devicePixelRatio, 2)
      c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0)
      // sample the image once on a cols×rows grid
      const s = document.createElement('canvas'); s.width = cols; s.height = rows
      const sg = s.getContext('2d')!; sg.drawImage(img, 0, 0, cols, rows)
      const d = sg.getImageData(0, 0, cols, rows).data
      const order = Array.from({ length: cols * rows }, () => Math.random())
      const draw = () => {
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H)
        g.font = `500 ${ch * 1.05}px 'JetBrains Mono', ui-monospace, monospace`; g.textBaseline = 'top'
        if (p > 0) g.drawImage(img, 0, 0, W, H)
        for (let i = 0; i < cols * rows; i++) {
          if (order[i] < p) continue
          const x = i % cols, y = (i / cols) | 0, k = i * 4
          const l = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255
          if (p > 0) { g.fillStyle = '#000'; g.fillRect(x * cw, y * ch, cw, ch) }
          const v = paper ? Math.min(1, (1 - l) / 0.75) : l
          if (paper && v < 0.2) continue
          // without a tint, use the image's own colour, lifted so dark tones still read on black
          g.fillStyle = tint ? tint(v) : `rgb(${Math.min(255, d[k] * 1.6 + 20)},${Math.min(255, d[k + 1] * 1.6 + 20)},${Math.min(255, d[k + 2] * 1.6 + 30)})`
          g.fillText(RAMP[Math.min(RAMP.length - 1, (v * RAMP.length) | 0)], x * cw, y * ch)
        }
      }
      const tick = () => {
        const goal = hover.current ? 0 : target
        p += (goal - p) * 0.06; if (Math.abs(goal - p) < 0.002) p = goal
        draw(); raf = p !== goal ? requestAnimationFrame(tick) : 0
      }
      draw()
      if (reveal) {
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => { target = 1.001; if (!raf) raf = requestAnimationFrame(tick) }, 700); io.disconnect() } }, { threshold: 0.4 })
        io.observe(c); undo.push(() => io.disconnect())
        const on = () => { hover.current = true; if (!raf) raf = requestAnimationFrame(tick) }
        const off = () => { hover.current = false; if (!raf) raf = requestAnimationFrame(tick) }
        c.addEventListener('pointerenter', on); c.addEventListener('pointerleave', off)
        undo.push(() => { c.removeEventListener('pointerenter', on); c.removeEventListener('pointerleave', off) })
      }
    }
    return () => { dead = true; cancelAnimationFrame(raf); undo.forEach((f) => f()) }
  }, [src, cols, reveal, paper, tint])
  return <canvas ref={ref} className={`ascii-art ${className}`} role="img" aria-label={alt} style={{ aspectRatio: `1 / ${ratio}` }} />
}
