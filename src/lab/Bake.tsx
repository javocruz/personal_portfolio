import { useEffect, useState } from 'react'
import { paintToImage, lastLayerCount } from './art/paint'
import { PLATES } from './art/plates'
import { PLATES_MONDRIAN } from './art/plates-mondrian'
import { LEVEL } from './art/mondrian'
import { runLayers } from './art/layers'
import { PLATES_ROTHKO } from './art/plates-rothko'
import { faceSheet } from './art/faces'
import { loadRef, makePortrait } from './art/portrait'
import { EyeOfNature } from '../components/EyeOfNature'

/** A canvas scaled to `w` pixels wide, as a JPEG data URL. */
function jpeg(src: HTMLCanvasElement, w: number, quality: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = Math.round((src.height / src.width) * w)
  const g = c.getContext('2d')!; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', quality)
}

/** Dev tool: renders every code painting once and saves it via the dev server, so production serves plain JPEGs. */
export default function Bake() {
  const [log, setLog] = useState<string[]>([])
  useEffect(() => {
    const say = (s: string) => setLog((l) => [...l, s])
    ;(async () => {
      if (location.search.includes('eye')) {
        // the still eye for Complete's contact section: let the rays settle, then grab the canvas
        await new Promise((r) => setTimeout(r, 1800))
        const c = document.querySelector<HTMLCanvasElement>('#bake-eye canvas')!
        const r = await fetch('/__bake?name=eye', { method: 'POST', body: c.toDataURL('image/jpeg', 0.9) })
        return say(`eye: ${r.ok ? 'saved' : 'FAILED'} (${c.width}x${c.height})`)
      }
      const q = new URLSearchParams(location.search)
      const save = async (name: string, url: string) => {
        const r = await fetch(`/__bake?name=${name}`, { method: 'POST', body: url })
        say(`${name}: ${r.ok ? 'saved' : 'FAILED ' + r.status} (${Math.round(url.length / 1365)} KB)`)
      }
      if (q.has('core')) {
        // Core's paintings (plain Canvas 2D). Writes the served sizes directly: -1200 and -600 for each plate, and
        // -l{k}-600 for every Technique step. Rothko as plate-{id}-rothko; Mondrian at LEVEL as plate-{id}-mondrian,
        // plus the other levels as plate-{id}-mondrian-lv{n} (no steps). ?core=rothko|mondrian bakes one style,
        // ?only=frost one plate.
        const W = 1200, H = 1500
        const draw = (paint: (ctx: CanvasRenderingContext2D) => void, layers?: number) => {
          const c = document.createElement('canvas'); c.width = W; c.height = H
          const n = runLayers(() => paint(c.getContext('2d')!), layers)
          return { c, n }
        }
        const out = async (name: string, c: HTMLCanvasElement, steps: number, paintAt?: (k: number) => HTMLCanvasElement) => {
          await save(`${name}-1200`, jpeg(c, 1200, 0.84))
          await save(`${name}-600`, jpeg(c, 600, 0.8))
          if (paintAt) for (let k = 1; k < steps; k++) await save(`${name}-l${k}-600`, jpeg(paintAt(k), 600, 0.78))
        }
        const pick = (style: string, id: string) => (!q.get('core') || q.get('core') === style) && (!q.get('only') || q.get('only') === id)
        for (const p of PLATES_ROTHKO) {
          if (!pick('rothko', p.id)) continue
          const go = (ctx: CanvasRenderingContext2D) => p.paint(ctx, W, H, p.seed)
          const { c, n } = draw(go)
          await out(`plate-${p.id}-rothko`, c, n, (k) => draw(go, k).c)
        }
        for (const p of PLATES_MONDRIAN) {
          if (!pick('mondrian', p.id)) continue
          for (const lv of [1, 2, 3] as const) {
            const go = (ctx: CanvasRenderingContext2D) => p.paint(ctx, W, H, p.seeds[lv], lv)
            const { c, n } = draw(go)
            if (lv === LEVEL) await out(`plate-${p.id}-mondrian`, c, n, (k) => draw(go, k).c)
            else await out(`plate-${p.id}-mondrian-lv${lv}`, c, n)
          }
        }
        return say('done')
      }
      for (let i = 0; i < PLATES.length; i++) {
        const p = PLATES[i]
        await save(`plate-${p.id}`, await paintToImage(`bake-${p.id}`, p.sketch, { W: 800, H: 1000, seed: p.seed }))
        // the recipe on Core shows the painting after each layer() step; the last step is the full plate
        const n = lastLayerCount()
        for (let k = 1; k < n; k++) await save(`plate-${p.id}-l${k}`, await paintToImage(`bake-${p.id}-${k}`, p.sketch, { W: 800, H: 1000, seed: p.seed, layers: k }))
      }
      if (location.search.includes('plates')) return say('done')
      await save('faces', await paintToImage('bake-faces', faceSheet, { W: 720, H: 960, bg: '#e8dfc9', seed: 77 }))
      const ref = await loadRef()
      await save('portrait', await paintToImage('bake-portrait', makePortrait(ref), { W: 720, H: 794, bg: '#efe6d4', seed: 42 }))
      say('done')
    })().catch((e) => say('error: ' + e))
  }, [])
  if (location.search.includes('eye')) return (
    <>
      <div id="bake-eye" style={{ width: 900, height: 1100, background: '#000' }}><EyeOfNature rays={900} eyeSize={0.13} reach={0.62} cy={0.46} palette="dusk" follow={false} seed={5} /></div>
      <pre>{log.join('\n')}</pre>
    </>
  )
  return <pre id="bake-log" style={{ padding: 24, color: '#eee', background: '#111', minHeight: '100vh' }}>{log.join('\n')}</pre>
}
