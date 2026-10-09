import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { SceneName } from '../scenes'

const SceneImpl = lazy(() => import('../scenes'))
const hasGPU = typeof navigator !== 'undefined' && 'gpu' in navigator

const fallbacks: Record<SceneName, string> = {
  hero: 'radial-gradient(ellipse at 70% 20%, #3a1408, #0a0908 70%)',
  hyper: 'linear-gradient(135deg, #1b2cff, #ff2bd6)',
  contact: 'linear-gradient(180deg, #0a0908, #3a1408)',
  fire: 'radial-gradient(circle at 30% 30%, #ff5b2e, #2a0d06 70%)',
  shield: 'radial-gradient(circle at 70% 30%, #18a6c9, #030a1a 70%)',
  pharma: 'radial-gradient(circle at 30% 70%, #0f6b4f, #04140f 70%)',
  stream: 'radial-gradient(circle at 70% 70%, #6b17e6, #0b0420 70%)',
  aero: 'linear-gradient(180deg, #04101a, #0f6d6d)',
  fruit: 'radial-gradient(circle at 30% 30%, #ff5b2e, #2a0d06 70%)',
}

/** Mounts a WebGPU canvas only while visible; falls back to a CSS gradient without WebGPU. */
export function Scene({ name, className = '' }: { name: SceneName; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !hasGPU) return
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`shader ${className}`} style={{ background: fallbacks[name] }} aria-hidden>
      {live && <Suspense fallback={null}><SceneImpl name={name} /></Suspense>}
    </div>
  )
}
