import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useMode } from '../lib/mode'
import { useCoreStyle, SHOW_CORE_STYLE_SWITCH } from '../lib/coreStyle'

export function Nav({ openPalette }: { openPalette: () => void }) {
  const { t, l, lang, setLang } = useI18n()
  const { style, setStyle } = useCoreStyle()
  const { pathname } = useLocation()
  const { mode, setMode } = useMode()
  const cur = (p: string) => (pathname === p || (p !== '/' && pathname.startsWith(p + '/')) ? 'page' : undefined)
  return (
    <header className="nav">
      <Link to="/" className="logo" aria-label="Javier Cruz Villarreal, home">JCV</Link>
      <nav aria-label="Main">
        {/* same four links in both modes, so the header doesn't change when you switch */}
        <Link to={mode === 'complete' ? '/work' : '/#work'} aria-current={cur('/work')}>{t('nav.work')}</Link>
        <Link className="hide-sm" to="/#about">{t('about.title')}</Link>
        <Link className="hide-xs" to="/blog" aria-current={cur('/blog')}>{t('nav.writing')}</Link>
        <Link className="nav-cta" to="/#contact">{t('nav.contact')}</Link>
      </nav>
      <div className="tools">
        {mode && (
          // one control in both modes; the thumb slides across when you switch
          <div className="mode-switch" role="group" aria-label="Site mode" data-on={mode}>
            <button aria-pressed={mode === 'core'} onClick={() => setMode('core')}>Core</button>
            <button aria-pressed={mode === 'complete'} onClick={() => setMode('complete')}>Complete</button>
          </div>
        )}
        {mode === 'core' && SHOW_CORE_STYLE_SWITCH && (
          // Core's two painters, in the same slider as the mode switch
          <div className="mode-switch style-switch" role="group" aria-label={l({ en: 'Painting style', es: 'Estilo de pintura' })} data-on={style}>
            <button aria-pressed={style === 'mondrian'} onClick={() => setStyle('mondrian')} aria-label={l({ en: 'Mondrian style', es: 'Estilo Mondrian' })} title={l({ en: 'Mondrian style', es: 'Estilo Mondrian' })}>
              <svg viewBox="0 0 12 12" aria-hidden><rect x=".5" y=".5" width="11" height="11" fill="#f7f5ef" stroke="#111" /><rect x="1" y="1" width="5" height="5" fill="#d4271b" /><rect x="7" y="7" width="4" height="4" fill="#1d3c8f" /><rect x="7" y="1" width="4" height="2.5" fill="#f2c40c" /><path d="M6.5 .5v11M.5 6.5h11M6.5 4h5" stroke="#111" /></svg>
              <span>Mondrian</span>
            </button>
            <button aria-pressed={style === 'rothko'} onClick={() => setStyle('rothko')} aria-label={l({ en: 'Rothko style', es: 'Estilo Rothko' })} title={l({ en: 'Rothko style', es: 'Estilo Rothko' })}>
              <svg viewBox="0 0 12 12" aria-hidden><defs><filter id="rk-soft"><feGaussianBlur stdDeviation=".45" /></filter></defs><rect width="12" height="12" rx="1" fill="#f1e2cc" /><g filter="url(#rk-soft)"><rect x="1.6" y="1.6" width="8.8" height="4.6" fill="#e0662a" /><rect x="1.6" y="7.2" width="8.8" height="3.2" fill="#7a1f1a" /></g></svg>
              <span>Rothko</span>
            </button>
          </div>
        )}
        <button className="tool search-tool" onClick={openPalette} aria-label={t('search')} title={`${t('search')} (⌘K)`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
          <kbd className="hide-sm">⌘K</kbd>
        </button>
        <button className="tool" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} aria-label={t('lang.toggle')} title={t('lang.toggle')}>{lang === 'en' ? 'ES' : 'EN'}</button>
      </div>
    </header>
  )
}
