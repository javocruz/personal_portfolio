import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'

export default function NotFound() {
  const { t } = useI18n()
  useHead(`${t('404.title')} — Javier Cruz Villarreal`)
  return (
    <main className="blog">
      <header className="blog-head">
        <p className="mono dim">404</p>
        <h1>{t('404.title')}</h1>
        <p>{t('404.text')}</p>
        <Link className="btn solid" to="/">{t('404.home')}</Link>
      </header>
    </main>
  )
}
