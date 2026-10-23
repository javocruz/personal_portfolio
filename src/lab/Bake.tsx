import { useEffect, useState } from 'react'
import { paintToImage, lastLayerCount } from './art/paint'
import { PLATES } from './art/plates'
import { PLATES_MONDRIAN } from './art/plates-mondrian'
import { PLATES_ROTHKO } from './art/plates-rothko'
import { faceSheet } from './art/faces'
import { loadRef, makePortrait } from './art/portrait'
import { EyeOfNature } from '../components/EyeOfNature'

/** Scales a baked painting to `w` pixels wide and re-encodes it as JPEG. */
async function resize(url: string, w: number, quality: number) {
  const img = new Image(); img.src = url; await img.decode()
  const c = document.createElement('canvas'); c.width = w; c.height = Math.round((img.height / img.width) * w)
  const g = c.getContext('2d')!; g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height)
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
        // Core's two styles. Writes the served sizes directly: -1200 and -600 for each plate, -l{k}-600 for every
        // recipe step. ?core=mondrian|rothko bakes one set, ?only=frost one plate.
        const sets = { mondrian: { list: PLATES_MONDRIAN, bg: '#f4f1e8' }, rothko: { list: PLATES_ROTHKO, bg: '#efe3d2' } }
        for (const [style, { list, bg }] of Object.entries(sets)) {
          if (q.get('core') && q.get('core') !== style) continue
          for (const p of list) {
            if (q.get('only') && q.get('only') !== p.id) continue
            const name = `plate-${p.id}-${style}`, opts = { W: 800, H: 1000, seed: p.seed, bg }
            const full = await paintToImage(`bake-${name}`, p.sketch, opts)
            const n = lastLayerCount()
            await save(`${name}-1200`, await resize(full, 1200, 0.86))
            await save(`${name}-600`, await resize(full, 600, 0.82))
            for (let k = 1; k < n; k++) await save(`${name}-l${k}-600`, await resize(await paintToImage(`bake-${name}-${k}`, p.sketch, { ...opts, layers: k }), 600, 0.8))
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
