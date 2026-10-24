import { type ReactNode } from 'react'
import { isle } from '../content/art'

/** The Complete hero: Böcklin's Isle of the Dead in its own colours (pre-baked), with the name over it. */
export function IsleHero({ children }: { children?: ReactNode }) {
  return (
    <section className="isle-hero stage">
      <img className="isle-img" src={isle.dusk.src} srcSet={isle.dusk.set} sizes="100vw" alt="Arnold Böcklin, Isle of the Dead (1883)" {...{ fetchpriority: 'high' }} />
      <div className="grain" aria-hidden />
      {children}
    </section>
  )
}
