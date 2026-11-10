import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { Pond } from './Pond'
import { StepLink } from './steps'
import { useSiteTheme } from './SiteNav'

/** The site's 404: the playground keeps running, with one line over it. */
export function SiteNotFound() {
  const { l } = useI18n()
  const { light } = useSiteTheme()
  useHead(l({ en: 'Not found · Javier Cruz Villarreal', es: 'No encontrado · Javier Cruz Villarreal' }))
  return (
    <main className="site-main site-home">
      <Pond ink={light ? '38,37,35' : '255,247,240'} accent={light ? '196,92,40' : '224,122,63'} />
      <div className="home-col">
        <p className="home-tag" data-block data-pond-avoid style={{ ['--order' as string]: 0 }}>404 · {l({ en: 'nothing here', es: 'aquí no hay nada' })}</p>
        <p className="home-prose" data-block data-pond-avoid style={{ ['--order' as string]: 1 }}>
          <StepLink to="/">{l({ en: 'back to the playground', es: 'volver al playground' })}</StepLink>
        </p>
      </div>
    </main>
  )
}
