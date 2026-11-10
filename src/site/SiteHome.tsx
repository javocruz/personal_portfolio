import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { mxt, profile } from '../content/profile'
import { ContactForm } from '../components/ContactForm'
import { Pond } from './Pond'
import { StepLink } from './steps'
import { useSiteTheme } from './SiteNav'
import { plateSrc } from '../content/art'

/** A link to a project that shows its painting beside the cursor while you hover it (pointers that can hover only). */
function Peek({ slug, children }: { slug: string; children: ReactNode }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null)
  const move = (e: React.PointerEvent) => { if (e.pointerType === 'mouse') setAt({ x: e.clientX, y: e.clientY }) }
  return (
    <>
      <StepLink to={`/projects/${slug}`} onPointerMove={move} onPointerLeave={() => setAt(null)}>{children}</StepLink>
      {at && <img className="peek" src={plateSrc(slug)} alt="" aria-hidden style={{ left: at.x + 18, top: at.y - 150 }} />}
    </>
  )
}

/** Types `text` out one character at a time, then holds. Reduced motion shows it whole. */
function useTyped(text: string, delay = 500, speed = 42) {
  const [n, setN] = useState(() => (matchMedia('(prefers-reduced-motion: reduce)').matches ? text.length : 0))
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); return }
    setN(0)
    let i = 0, id = 0
    const start = window.setTimeout(() => { id = window.setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(id) }, speed) }, delay)
    return () => { clearTimeout(start); clearInterval(id) }
  }, [text, delay, speed])
  return text.slice(0, n)
}

/** The site's home (after daoho.dev): the playground, a two-line tagline that types itself, a short intro and the links. */
export default function SiteHome() {
  const { l } = useI18n()
  const { light } = useSiteTheme()
  const [writing, setWriting] = useState(false)
  useHead('Javier Cruz Villarreal', l({ en: 'CTO and Computer Science & AI student in Madrid. I build AI products from idea to demo.', es: 'CTO y estudiante de Ciencias de la Computación e IA en Madrid. Construyo productos de IA de la idea a la demo.' }))
  // the tagline (a placeholder line until the final one is chosen)
  const tag = l({ en: 'from idea to demo,\nthen make people care', es: 'de la idea a la demo,\ny que a la gente le importe' })
  const typed = useTyped(tag)
  return (
    <main className="site-main site-home">
      <Pond ink={light ? '38,37,35' : '255,247,240'} accent={light ? '196,92,40' : '224,122,63'} />
      <div className="home-col">
        <p className="home-tag" data-block data-pond-avoid style={{ ['--order' as string]: 0 }} aria-label={tag.replace('\n', ' ')}>
          <span aria-hidden>{typed.split('\n').map((line, i) => <span key={i}>{i ? <br /> : null}{line}</span>)}<span className="caret" /></span>
        </p>
        <div className="home-prose" data-block data-pond-avoid style={{ ['--order' as string]: 1 }}>
          <p>{l({ en: 'Hola, I’m Javier.', es: 'Hola, soy Javier.' })}</p>
          <p>{l({ en: 'CTO @ Hospitia, building an AI inspection platform for hotels.', es: 'CTO @ Hospitia, construyendo una plataforma de inspección con IA para hoteles.' })}</p>
          <p>
            {l({ en: 'Before that, ', es: 'Antes, ' })}
            <Peek slug="sybol-compliance-engine">Sybol</Peek>, Outamation{l({ en: ', and a few hackathons: 1st in Madrid @ ', es: ' y algunos hackathons: 1er lugar en Madrid @ ' })}
            <Peek slug="snapfrost">BCG Platinion</Peek>{l({ en: ', 1st @ ', es: ', 1er lugar @ ' })}
            <Peek slug="los-panaderos">HackSpain</Peek>.
          </p>
          <p>{l({ en: 'Currently, studying CS & AI @ ', es: 'Ahora, estudio CS e IA @ ' })}<a href="https://www.ie.edu/" target="_blank" rel="noreferrer">IE University</a>{l({ en: ', partnerships @ IE Tech Club, and part of ', es: ', llevo alianzas @ IE Tech Club y soy parte de ' })}<a href={mxt} target="_blank" rel="noreferrer">IE MxT</a>.</p>
          <p className="home-links">
            <a href={profile.github} target="_blank" rel="noreferrer">github</a> / <a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin</a> / <a href={`mailto:${profile.email}`}>email</a> / <a href={profile.cv} download>cv</a> / <button className="home-write" aria-expanded={writing} onClick={() => setWriting((v) => !v)}>{l({ en: 'write to me', es: 'escríbeme' })}</button>
          </p>
          {writing && <div className="home-form"><ContactForm /></div>}
        </div>
      </div>
    </main>
  )
}
