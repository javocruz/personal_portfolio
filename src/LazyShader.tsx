import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Shader } from 'shaders/react'

const hasGPU = typeof navigator !== 'undefined' && 'gpu' in navigator

/** Mounts a WebGPU canvas only while visible; CSS gradient fallback otherwise. */
export function LazyShader({ children, fallback, className = '' }: { children: ReactNode; fallback: string; className?: string }) {
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
    <div ref={ref} className={`shader ${className}`} style={{ background: fallback }}>
      {live && <Shader className="shader-canvas">{children}</Shader>}
    </div>
  )
}
