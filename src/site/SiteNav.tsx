import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { StepLink } from './steps'

/** The site's light/dark theme, remembered. Dark is the default. */
export function useSiteTheme() {
  const [light, setLight] = useState(() => document.documentElement.dataset.siteTheme === 'light')
  useEffect(() => {
    if (light === (document.documentElement.dataset.siteTheme === 'light')) return
    if (light) document.documentElement.dataset.siteTheme = 'light'; else delete document.documentElement.dataset.siteTheme
    try { localStorage.setItem('siteTheme', light ? 'light' : 'dark') } catch { /* ignore */ }
    dispatchEvent(new Event('site-theme'))
  }, [light])
  // the header and the command menu each hold one: keep them in step
  useEffect(() => {
    const sync = () => setLight(document.documentElement.dataset.siteTheme === 'light')
    addEventListener('site-theme', sync)
    return () => removeEventListener('site-theme', sync)
  }, [])
  return { light, toggle: () => setLight((v) => !v) }
}

const Sun = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></svg>
const Moon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6a5.6 5.6 0 1 0 7 7Z" /></svg>

/** The time where I am, ticking. */
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  return <time className="snav-clock">madrid {now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Madrid' })}</time>
}

/**
 * The site's header (after daoho.dev): lowercase, centred, the current page at full strength and the rest at half.
 * The time in Madrid sits at the far left. On phones it becomes a single bar with the name and a menu.
 */
export function SiteNav({ openPalette }: { openPalette: () => void }) {
  const { l, lang, setLang } = useI18n()
  const { pathname } = useLocation()
  const { light, toggle } = useSiteTheme()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])
  const links: [string, string][] = [
    ['/', 'playground'],
    ['/guestbook', l({ en: 'guestbook', es: 'libro de visitas' })],
    ['/projects', l({ en: 'projects', es: 'proyectos' })],
    ['/about', l({ en: 'about', es: 'sobre mí' })],
    ['/blog', 'blog'],
  ]
  const current = (to: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/'))
  const tools = (
    <>
      <button className="snav-tool" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}>{lang === 'en' ? 'es' : 'en'}</button>
      <button className="snav-tool snav-k" onClick={openPalette} aria-label={l({ en: 'Open the command menu', es: 'Abrir el menú de comandos' })}>{/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'ctrl K'}</button>
      <button className="snav-tool" onClick={toggle} aria-label={light ? l({ en: 'Dark theme', es: 'Tema oscuro' }) : l({ en: 'Light theme', es: 'Tema claro' })}>{light ? <Moon /> : <Sun />}</button>
    </>
  )
  return (
    <>
      <nav className="snav" aria-label="Main" data-pond-avoid>
        <Clock />
        {links.map(([to, label]) => <StepLink key={to} to={to} aria-current={current(to) ? 'page' : undefined}>{label}</StepLink>)}
        {tools}
      </nav>
      <div className="snav-m" data-pond-avoid>
        <StepLink to="/" className="snav-m-name">Javier Cruz</StepLink>
        <button className="snav-m-menu" aria-expanded={open} aria-label={l({ en: 'Menu', es: 'Menú' })} onClick={() => setOpen((v) => !v)}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="currentColor"><circle cx="4" cy="4" r="1.2" /><circle cx="12" cy="4" r="1.2" /><circle cx="4" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="8" cy="8" r="1.2" /></svg>
        </button>
        {open && (
          <div className="snav-m-list">
            {links.map(([to, label]) => <StepLink key={to} to={to} aria-current={current(to) ? 'page' : undefined}>{label}</StepLink>)}
            <div className="snav-m-tools">{tools}<Clock /></div>
          </div>
        )}
      </div>
    </>
  )
}
