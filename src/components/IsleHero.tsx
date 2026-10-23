import { useEffect, useRef, useState, type ReactNode } from 'react'
import { isle } from '../content/art'

/**
 * The Complete hero: Böcklin's isle at dusk (pre-baked), and a lens
 * that follows the cursor and reveals the 1-bit dithered version underneath.
 */
export function IsleHero({ children }: { children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  // the dither image is only fetched once someone actually moves over the hero
  const [lens, setLens] = useState(false)
  // dither lens
  useEffect(() => {
    const el = box.current!
    const move = (e: PointerEvent) => {
      setLens(true)
      const b = el.getBoundingClientRect()
      el.style.setProperty('--lx', `${e.clientX - b.left}px`)
      el.style.setProperty('--ly', `${e.clientY - b.top}px`)
      el.style.setProperty('--lr', e.pointerType === 'mouse' ? '170px' : '120px')
    }
    const leave = () => el.style.setProperty('--lr', '0px')
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])

  return (
    <section className="isle-hero stage" ref={box}>
      <img className="isle-img" src={isle.dusk.src} srcSet={isle.dusk.set} sizes="100vw" alt="Arnold Böcklin, Isle of the Dead (1883), recoloured" {...{ fetchpriority: 'high' }} />
      {lens && <img className="isle-img isle-lens" src={isle.dither.src} srcSet={isle.dither.set} sizes="100vw" alt="" aria-hidden />}
      <div className="grain" aria-hidden />
      <div className="isle-hint mono" aria-hidden>Move to develop the plate</div>
      {children}
    </section>
  )
}
