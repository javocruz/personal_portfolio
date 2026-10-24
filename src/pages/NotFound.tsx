import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { useMode } from '../lib/mode'
import { AsciiArt } from '../components/AsciiArt'
import { isle } from '../content/art'


export default function NotFound() {
  const { t, l } = useI18n()
  const { mode } = useMode()
  useHead(`${t('404.title')} · Javier Cruz Villarreal`)
  // Complete: the last of Cole's paintings, Desolation, as text
  const complete = mode === 'complete'
  return (
    <main className="blog lost">
      <AsciiArt className="lost-art" src={complete ? '/art/cycle/desolation-960.jpg' : isle.dusk.src} alt="" cols={150} />
      <header className="blog-head">
        <p className="mono dim">404</p>
        <h1>{complete ? l({ en: 'Nothing left here.', es: 'Aquí ya no queda nada.' }) : t('404.title')}</h1>
        {!complete && <p>{t('404.text')}</p>}
        <Link className="btn solid" to="/">{t('404.home')}</Link>
      </header>
    </main>
  )
}
