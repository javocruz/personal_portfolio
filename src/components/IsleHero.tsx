import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EyeOfNature } from './EyeOfNature'
import { isle } from '../content/art'

/**
 * The Complete hero: Böcklin's isle at dusk (pre-baked), the eye rising from the gap in the cypresses, and a lens
 * that follows the cursor and reveals the 1-bit dithered version underneath.
 */
export function IsleHero({ children }: { children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [eye, setEye] = useState({ x: 0.5, y: 0.3 })

  // keep the eye on the gap in the trees, whatever the crop (object-fit: cover)
  useEffect(() => {
    const el = box.current!
    const place = () => {
      const W = el.clientWidth, H = el.clientHeight
      const imgW = W / H > isle.aspect ? W : H * isle.aspect
      const imgH = imgW / isle.aspect
      setEye({ x: ((W - imgW) / 2 + isle.gap.x * imgW) / W, y: ((H - imgH) / 2 + isle.gap.y * imgH) / H })
    }
    place()
    const ro = new ResizeObserver(place); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // dither lens
  useEffect(() => {
    const el = box.current!
    const move = (e: PointerEvent) => {
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
      <img className="isle-img" src={isle.dusk.src} srcSet={isle.dusk.set} sizes="100vw" alt="Arnold Böcklin, Isle of the Dead (1883), recoloured" fetchPriority="high" />
      <img className="isle-img isle-lens" src={isle.dither.src} srcSet={isle.dither.set} sizes="100vw" alt="" aria-hidden />
      <div className="isle-eye" aria-hidden><EyeOfNature rays={760} arc={[180, 360]} cx={eye.x} cy={eye.y} eyeSize={0.045} reach={0.52} palette="gold" seed={11} /></div>
      <div className="grain" aria-hidden />
      <div className="isle-hint mono" aria-hidden>Move to develop the plate</div>
      {children}
    </section>
  )
}
