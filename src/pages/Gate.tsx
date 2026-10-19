import { useI18n } from '../lib/i18n'
import { useMode } from '../lib/mode'
import { useHead } from '../lib/head'
import { isle } from '../content/art'
import { Smoke } from '../components/Smoke'

/** The entrance: choose how to see the site. Shown once, then remembered. */
export default function Gate() {
  const { setMode } = useMode()
  const { l } = useI18n()
  useHead('Javier Cruz Villarreal', l({ en: 'Choose how to see the site: Core or Complete.', es: 'Elige cómo ver el sitio: Core o Complete.' }))
  return (
    <main className="gate">
      <p className="gate-name">Javier Cruz Villarreal</p>
      <button className="gate-half gate-core" onClick={() => setMode('core')}>
        <span className="gate-word">Core</span>
      </button>
      <button className="gate-half gate-complete" onClick={() => setMode('complete')}>
        <img src={isle.dusk.src} srcSet={isle.dusk.set} sizes="60vw" alt="" className="gate-bg" />
        <Smoke className="gate-smoke" />
        <span className="gate-word"><em>Complete</em></span>
      </button>
    </main>
  )
}
