import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { AsciiArt } from '../components/AsciiArt'
import { isle } from '../content/art'


export default function NotFound() {
  const { t } = useI18n()
  useHead(`${t('404.title')} — Javier Cruz Villarreal`)
  return (
    <main className="blog lost">
      <AsciiArt className="lost-art" src={isle.dusk.src} alt="" cols={150} />
      <header className="blog-head">
        <p className="mono dim">404</p>
        <h1>{t('404.title')}</h1>
        <p>{t('404.text')}</p>
        <Link className="btn solid" to="/">{t('404.home')}</Link>
      </header>
    </main>
  )
}
