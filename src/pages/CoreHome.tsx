import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { useMode } from '../lib/mode'
import { profile, experience } from '../content/profile'
import { projects, builds } from '../content/projects'
import { paintingSrc, plateSrc } from '../content/art'
import { posts } from '../posts'

/** Madrid time, ticking once a minute. */
function useMadridTime() {
  const fmt = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })
  const [t, setT] = useState(fmt)
  useEffect(() => { const id = setInterval(() => setT(fmt()), 30_000); return () => clearInterval(id) }, [])
  return t
}

/**
 * Core: everything on one page (the dimden.dev idea), set like a studio index: white, small type, hairlines.
 * No canvas, no shaders. Project paintings only load when you hover a row.
 */
export default function CoreHome() {
  const { l, lang, setLang } = useI18n()
  const { setMode } = useMode()
  const time = useMadridTime()
  const peek = useRef<HTMLImageElement>(null)
  const pos = useRef('translate(-999px, 0)')
  const [hover, setHover] = useState<string | null>(null)
  useHead('Javier Cruz Villarreal — CS & AI', l({ en: 'Computer Science & AI student in Madrid who builds AI products from idea to demo.', es: 'Estudiante de Ciencias de la Computación e IA en Madrid que construye productos de IA de la idea a la demo.' }))
  const date = (d: string) => new Date(d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const move = (e: React.PointerEvent) => {
    pos.current = `translate(${e.clientX + 24}px, ${e.clientY - 90}px)`
    if (peek.current) peek.current.style.transform = pos.current
  }

  const facts: [string, string][] = [
    [l({ en: 'Based', es: 'Base' }), 'Madrid'],
    [l({ en: 'Studying', es: 'Estudio' }), l({ en: 'CS & AI, IE University, ’28', es: 'CC e IA, IE University, ’28' })],
    [l({ en: 'Building', es: 'Construyo' }), 'Pharmable'],
    [l({ en: 'CTO', es: 'CTO' }), 'Hospitia'],
    [l({ en: 'Speaks', es: 'Hablo' }), l({ en: 'Spanish, English', es: 'Español, inglés' })],
  ]

  return (
    <main className="one">
      <header className="one-top">
        <span>Javier Cruz Villarreal</span>
        <span className="one-dim">{l({ en: 'Madrid', es: 'Madrid' })} {time}</span>
        <nav>
          <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>{lang === 'en' ? 'Español' : 'English'}</button>
          <button onClick={() => setMode('complete')}>{l({ en: 'Complete version', es: 'Versión completa' })}</button>
        </nav>
      </header>

      <section className="one-intro">
        <img src={paintingSrc('portrait', 600)} alt={l({ en: 'Painted portrait of Javier', es: 'Retrato pintado de Javier' })} width={120} height={150} />
        <p>{l({ en: 'I study Computer Science and AI in Madrid and build AI products from idea to demo. Mostly compliance, vision and agents, usually as the person closest to the customer.', es: 'Estudio Ciencias de la Computación e IA en Madrid y construyo productos de IA de la idea a la demo. Sobre todo cumplimiento normativo, visión y agentes, normalmente como la persona más cerca del cliente.' })}</p>
      </section>

      <dl className="one-facts">
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <section className="one-sec" id="work">
        <h2>{l({ en: 'Projects', es: 'Proyectos' })} <sup>{projects.length}</sup></h2>
        <ul className="one-rows" onPointerMove={move} onPointerLeave={() => setHover(null)}>
          {projects.map((p) => (
            <li key={p.slug} onPointerEnter={(e) => { move(e); setHover(p.slug) }}>
              <Link to={`/work/${p.slug}`}>
                <span className="one-t">{p.title}</span>
                <span className="one-d">{l(p.tagline)}</span>
                <span className="one-m">{l(p.badge)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="one-after">{l({ en: 'Also: ', es: 'También: ' })}{builds.map((b, i) => <span key={b.title}>{i ? ', ' : ''}{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title}</a> : b.title}</span>)}.</p>
      </section>

      <section className="one-sec" id="experience">
        <h2>{l({ en: 'Experience', es: 'Experiencia' })}</h2>
        <ul className="one-rows">
          {experience.map((x, i) => (
            <li key={x.org + i}><div>
              <span className="one-t">{l(x.role)}</span>
              <span className="one-d">{x.org}</span>
              <span className="one-m">{l(x.when)}</span>
            </div></li>
          ))}
        </ul>
        <p className="one-after"><Link to="/cv">{l({ en: 'Full CV', es: 'CV completo' })}</Link></p>
      </section>

      <section className="one-sec">
        <h2>{l({ en: 'Writing', es: 'Escritos' })} <sup>{posts.length}</sup></h2>
        {posts.length ? (
          <ul className="one-rows">
            {posts.map((p) => <li key={p.slug}><Link to={`/blog/${p.slug}`}><span className="one-t">{p.title}</span><span className="one-d" /><span className="one-m">{date(p.date)}</span></Link></li>)}
          </ul>
        ) : <p className="one-after one-dim">{l({ en: 'First post soon.', es: 'Primer post pronto.' })}</p>}
      </section>

      <section className="one-sec" id="contact">
        <h2>{l({ en: 'Contact', es: 'Contacto' })}</h2>
        <a className="one-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
        <p className="one-after"><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>, <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a></p>
        <details className="one-form">
          <summary>{l({ en: 'Or write here', es: 'O escribe aquí' })}</summary>
          <ContactForm />
        </details>
      </section>

      <footer className="one-foot"><span>© 2026</span><span>{l({ en: 'Hand-made in Madrid', es: 'Hecho a mano en Madrid' })}</span></footer>

      {hover && plateSrc(hover) && <img ref={peek} className="one-peek" style={{ transform: pos.current }} src={plateSrc(hover)} alt="" aria-hidden />}
    </main>
  )
}
