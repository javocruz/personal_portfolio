import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { useMode } from '../lib/mode'
import { profile, experience, now, skills } from '../content/profile'
import { projects, builds } from '../content/projects'
import { paintingSrc } from '../content/art'
import { posts } from '../posts'

const Moon = () => <span className="rt-moon" aria-hidden>☾</span>

/**
 * Core: one page, old-web style (after dimden.dev). Boxed panels, pixel headings, everything on a single scroll.
 * No canvas and no shaders: text plus one small lazy image.
 */
export default function CoreHome() {
  const { l, lang, setLang } = useI18n()
  const { setMode } = useMode()
  useHead('Javier Cruz Villarreal — CS & AI', l({ en: 'Computer Science & AI student in Madrid who builds AI products from idea to demo.', es: 'Estudiante de Ciencias de la Computación e IA en Madrid que construye productos de IA de la idea a la demo.' }))
  const date = (d: string) => new Date(d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="retro">
      <header className="rt-top">
        <h1 className="rt-logo" aria-label="Javier Cruz Villarreal">JAVI CRUZ</h1>
        <div className="rt-menu">
          <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>{lang === 'en' ? 'ES' : 'EN'}</button>
          <button onClick={() => setMode('complete')}>{l({ en: 'Complete →', es: 'Completo →' })}</button>
        </div>
      </header>

      <section className="rt-box" aria-labelledby="rt-hi">
        <h2 id="rt-hi"><Moon />{l({ en: 'Welcome to javicruz.dev!', es: '¡Bienvenido a javicruz.dev!' })}</h2>
        <div className="rt-intro">
          <figure className="rt-avatar">
            <img src={paintingSrc('portrait', 600)} alt={l({ en: 'Painted portrait of Javier', es: 'Retrato pintado de Javier' })} width={140} height={175} />
            <figcaption>{l({ en: 'painted in code', es: 'pintado con código' })}</figcaption>
          </figure>
          <div>
            <p>{l({ en: 'Hi, I’m Javier. I study Computer Science and AI at IE University in Madrid, and I build AI products from idea to demo.', es: 'Hola, soy Javier. Estudio Ciencias de la Computación e IA en IE University, en Madrid, y construyo productos de IA de la idea a la demo.' })}</p>
            <p>{l({ en: 'This is the quick version of my site. For the full exhibition, ', es: 'Esta es la versión rápida de mi web. Para la exposición completa, ' })}<button className="rt-link" onClick={() => setMode('complete')}>{l({ en: 'step inside', es: 'entra aquí' })}</button>.</p>
          </div>
        </div>
        <p className="rt-sub">{l({ en: 'Some quick facts:', es: 'Algunos datos rápidos:' })}</p>
        <ul className="rt-list">
          {now.map((n, i) => <li key={i}>{l(n)}</li>)}
          <li>{l({ en: 'I won 1st place at HackSpain 2026 (HappyRobot track).', es: 'Gané el 1.er puesto en HackSpain 2026 (track HappyRobot).' })}</li>
          <li>{l({ en: 'My videos have reached 5M+ organic views.', es: 'Mis vídeos han llegado a más de 5M de vistas orgánicas.' })}</li>
          <li>{l({ en: 'I speak Spanish (native) and English (C1).', es: 'Hablo español (nativo) e inglés (C1).' })}</li>
          <li>{l({ en: 'I mostly write ', es: 'Sobre todo escribo ' })}{skills[1]?.items.slice(0, 4).join(', ')}.</li>
        </ul>
      </section>

      <section className="rt-box" id="work" aria-labelledby="rt-work">
        <h2 id="rt-work"><Moon />{l({ en: 'Projects', es: 'Proyectos' })}</h2>
        <ul className="rt-lines">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link to={`/work/${p.slug}`}>{p.title}</Link> <span className="rt-dim">— {l(p.badge)}, {l(p.when)}</span>
              <span className="rt-note">{l(p.tagline)}</span>
            </li>
          ))}
        </ul>
        <p className="rt-sub">{l({ en: 'Smaller things: ', es: 'Cosas más pequeñas: ' })}{builds.map((b, i) => <span key={b.title}>{i ? ', ' : ''}{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title}</a> : b.title}</span>)}.</p>
      </section>

      <section className="rt-box" id="experience" aria-labelledby="rt-xp">
        <h2 id="rt-xp"><Moon />{l({ en: 'Experience', es: 'Experiencia' })}</h2>
        <ul className="rt-lines">
          {experience.map((x, i) => (
            <li key={x.org + i}>{l(x.role)} <span className="rt-dim">@ {x.org} — {l(x.when)}</span></li>
          ))}
        </ul>
        <p className="rt-sub"><Link to="/cv">{l({ en: 'Full CV (three versions)', es: 'CV completo (tres versiones)' })}</Link></p>
      </section>

      <section className="rt-box" aria-labelledby="rt-blog">
        <h2 id="rt-blog"><Moon />Blog <a className="rt-rss" href="/rss.xml" aria-label="RSS">RSS</a></h2>
        {posts.length ? (
          <ul className="rt-lines">
            {posts.map((p) => <li key={p.slug}><Link to={`/blog/${p.slug}`}>{p.title}</Link> <span className="rt-dim">— {l({ en: 'Posted on', es: 'Publicado el' })} {date(p.date)}</span></li>)}
          </ul>
        ) : <p className="rt-dim">{l({ en: 'Nothing here yet. Soon.', es: 'Todavía nada. Pronto.' })}</p>}
      </section>

      <section className="rt-box" id="contact" aria-labelledby="rt-contact">
        <h2 id="rt-contact"><Moon />{l({ en: 'Say hi', es: 'Escríbeme' })}</h2>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> · <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </p>
        <div className="rt-form"><ContactForm /></div>
      </section>

      <footer className="rt-foot">
        <span className="rt-badge">MADE IN MADRID</span>
        <span className="rt-badge rt-red">NO COOKIES</span>
        <span className="rt-badge">HAND-CODED</span>
      </footer>
    </main>
  )
}
