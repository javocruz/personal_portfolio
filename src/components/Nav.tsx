import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useTheme } from '../lib/theme'

export function Nav({ openPalette }: { openPalette: () => void }) {
  const { t, lang, setLang } = useI18n()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const cur = (p: string) => (pathname === p || (p !== '/' && pathname.startsWith(p + '/')) ? 'page' : undefined)
  return (
    <header className="nav">
      <Link to="/" className="logo" aria-label="Javier Cruz Villarreal, home">JCV</Link>
      <nav aria-label="Main">
        <Link to="/work" aria-current={cur('/work')}>{t('nav.work')}</Link>
        <a className="hide-sm" href="/#experience">{t('nav.experience')}</a>
        <Link to="/blog" aria-current={cur('/blog')}>{t('nav.writing')}</Link>
        <Link className="hide-sm" to="/cv" aria-current={cur('/cv')}>{t('nav.cv')}</Link>
        <a className="hide-xs" href="/#contact">{t('nav.contact')}</a>
      </nav>
      <div className="tools">
        <button className="tool" onClick={openPalette} aria-label={t('search')} title={`${t('search')} (⌘K)`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
          <kbd className="hide-sm">⌘K</kbd>
        </button>
        <button className="tool" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} aria-label={t('lang.toggle')} title={t('lang.toggle')}>{lang === 'en' ? 'ES' : 'EN'}</button>
        <button className="tool" onClick={toggle} aria-label={t('theme.toggle')} title={t('theme.toggle')}>
          {theme === 'dark'
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" /></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" /></svg>}
        </button>
      </div>
    </header>
  )
}
