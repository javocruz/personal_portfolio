import { useI18n } from '../lib/i18n'
import { profile } from '../content/profile'
import { StepLink } from './steps'

/** The site's last line. On pages that fill the screen (home, the empty blog) it sits in the bottom corner instead. */
export function SiteFooter() {
  const { l } = useI18n()
  return (
    <footer className="sfoot" data-pond-avoid>
      <span>© {new Date().getFullYear()} <span className="sfoot-long">Javier Cruz Villarreal · {l({ en: 'every painting is code', es: 'cada pintura es código' })}</span></span>
      <span><StepLink to="/about#contact">{l({ en: 'contact', es: 'contacto' })}</StepLink> · <a href={`${profile.github}/personal_portfolio`} target="_blank" rel="noreferrer">{l({ en: 'source', es: 'código' })} ↗</a></span>
    </footer>
  )
}
