import { EyeOfNature } from '../components/EyeOfNature'
import { useI18n } from '../lib/i18n'
import { useMode } from '../lib/mode'
import { useHead } from '../lib/head'
import { isle } from '../content/art'

/** The entrance: choose how to see the site. Shown once, then remembered. */
export default function Gate() {
  const { setMode } = useMode()
  const { l, lang, setLang } = useI18n()
  useHead('Javier Cruz Villarreal', l({ en: 'Choose how to see the site: Core or Complete.', es: 'Elige cómo ver el sitio: Core o Complete.' }))
  return (
    <main className="gate">
      <p className="gate-name">Javier Cruz Villarreal</p>
      <button className="gate-half gate-core" onClick={() => setMode('core')}>
        <span className="gate-kicker">01</span>
        <span className="gate-word">Core</span>
        <span className="gate-line">{l({ en: 'Quick and simple. Everything that matters on one page.', es: 'Rápido y sencillo. Todo lo importante en una página.' })}</span>
        <span className="gate-meta">{l({ en: 'Loads instantly · great on phones', es: 'Carga al instante · ideal en móvil' })}</span>
      </button>
      <button className="gate-half gate-complete" onClick={() => setMode('complete')}>
        <img src={isle.dusk.src} srcSet={isle.dusk.set} sizes="60vw" alt="" className="gate-bg" />
        <span className="gate-kicker">02</span>
        <span className="gate-word"><em>Complete</em></span>
        <span className="gate-line">{l({ en: 'The full exhibition. Every project is a painting.', es: 'La exposición completa. Cada proyecto es una pintura.' })}</span>
        <span className="gate-meta">{l({ en: 'Best on a big screen', es: 'Mejor en pantalla grande' })}</span>
      </button>
      <div className="gate-eye" aria-hidden><EyeOfNature rays={320} eyeSize={0.11} reach={0.46} palette="gold" seed={9} /></div>
      <p className="gate-foot">
        {l({ en: 'You can switch any time from the menu.', es: 'Puedes cambiar cuando quieras desde el menú.' })}
        <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>{lang === 'en' ? 'Español' : 'English'}</button>
      </p>
    </main>
  )
}
