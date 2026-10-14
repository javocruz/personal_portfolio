import { useEffect, useState } from 'react'
import { paintToImage } from './art/paint'
import { PLATES } from './art/plates'
import { faceSheet } from './art/faces'
import { loadRef, makePortrait } from './art/portrait'

/** Dev tool: renders every code painting once and saves it via the dev server, so production serves plain JPEGs. */
export default function Bake() {
  const [log, setLog] = useState<string[]>([])
  useEffect(() => {
    const say = (s: string) => setLog((l) => [...l, s])
    ;(async () => {
      const save = async (name: string, url: string) => {
        const r = await fetch(`/__bake?name=${name}`, { method: 'POST', body: url })
        say(`${name}: ${r.ok ? 'saved' : 'FAILED ' + r.status} (${Math.round(url.length / 1365)} KB)`)
      }
      for (let i = 0; i < PLATES.length; i++) {
        const p = PLATES[i]
        await save(`plate-${p.id}`, await paintToImage(`bake-${p.id}`, p.sketch, { W: 800, H: 1000, seed: i + 1 }))
      }
      await save('faces', await paintToImage('bake-faces', faceSheet, { W: 720, H: 960, bg: '#e8dfc9', seed: 77 }))
      const ref = await loadRef()
      await save('portrait', await paintToImage('bake-portrait', makePortrait(ref), { W: 720, H: 794, bg: '#efe6d4', seed: 42 }))
      say('done')
    })().catch((e) => say('error: ' + e))
  }, [])
  return <pre id="bake-log" style={{ padding: 24, color: '#eee', background: '#111', minHeight: '100vh' }}>{log.join('\n')}</pre>
}
