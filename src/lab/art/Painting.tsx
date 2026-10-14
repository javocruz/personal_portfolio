import { useEffect, useState } from 'react'
import { paintToImage, type PaintOpts, type Sketch } from './paint'

export function Painting({ id, sketch, opts, className, alt = '' }: { id: string; sketch: Sketch; opts: PaintOpts; className?: string; alt?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    let dead = false
    paintToImage(id, sketch, opts).then((u) => !dead && setSrc(u)).catch((e) => { console.error(e); !dead && setErr(true) })
    return () => { dead = true }
  }, [id])
  if (err) return <div className={className} style={{ background: '#2a2430', display: 'grid', placeItems: 'center', color: '#999', font: '12px monospace' }}>painting failed</div>
  if (!src) return <div className={className} style={{ aspectRatio: `${opts.W}/${opts.H}`, background: '#14111a' }} aria-hidden />
  return <img className={className} src={src} alt={alt} style={{ display: 'block', width: '100%', height: 'auto' }} />
}
