import { useRef, type ReactNode } from 'react'

/**
 * A painting shown as 1-bit blue dither until you hover it; the colour version then opens up in a circle from where
 * the cursor came in. Both images are pre-rendered, so this is only CSS (a mask with an animated radius).
 */
export function DitherReveal({ children, dither, className = '' }: { children: ReactNode; dither: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const enter = (e: React.PointerEvent) => {
    const b = box.current!.getBoundingClientRect()
    box.current!.style.setProperty('--dx', `${e.clientX - b.left}px`)
    box.current!.style.setProperty('--dy', `${e.clientY - b.top}px`)
  }
  return (
    <div ref={box} className={`dither-reveal ${className}`} onPointerEnter={enter}>
      {children}
      <img className="dither-layer" src={dither} alt="" aria-hidden loading="lazy" />
    </div>
  )
}
