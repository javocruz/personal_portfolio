import { useCallback, useEffect, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Page changes on the site move in held poses, like hand-drawn animation on twos: everything runs on a clock of
 * 12 poses a second (POSE = 1/12 s). Leaving, the page sinks a few pixels and goes in two steps; arriving, every
 * [data-block] steps in after a beat, rising through three poses, in its --order. The CSS lives in site.css.
 */
export const POSE = 1000 / 12
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const html = () => document.documentElement

/** Plays the arrival: marks the page as entering for as long as the slowest block takes, then clears it. */
export function arrive() {
  if (reduce()) return
  html().dataset.phase = 'in'
  clearTimeout((arrive as { t?: number }).t)
  ;(arrive as { t?: number }).t = window.setTimeout(() => { if (html().dataset.phase === 'in') delete html().dataset.phase }, POSE * 14)
}

/** Navigates with the stepped transition: two poses out, then the new page arrives. */
export function useStepGo() {
  const navigate = useNavigate()
  return useCallback((to: string) => {
    const here = location.pathname + location.search + location.hash
    if (to === here) return
    if (reduce()) { navigate(to); return }
    html().dataset.phase = 'out'
    window.setTimeout(() => { navigate(to); arrive() }, POSE * 2)
  }, [navigate])
}

/** The arrival on first load. */
export function useArrive() { useEffect(() => { arrive() }, []) }

/** An internal link that leaves with the stepped transition. Modified clicks (new tab, etc.) behave normally. */
export function StepLink({ to, children, onClick, ...rest }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const go = useStepGo()
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault(); go(to)
  }
  return <a href={to} onClick={click} {...rest}>{children}</a>
}
