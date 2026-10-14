import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { profile, experience, now } from '../content/profile'
import { projects, builds } from '../content/projects'
import { plateSrc } from '../content/art'
import { posts } from '../posts'

/**
 * Core: quick and simple. One column of short "messages", a numbered index of work, and contact.
 * No canvas, no shaders: just text and a few small lazy images.
 */
export default function CoreHome() {
  const { l, t } = useI18n()
  useHead('Javier Cruz Villarreal — CS & AI', l({ en: 'Computer Science & AI student in Madrid who builds AI products from idea to demo.', es: 'Estudiante de Ciencias de la Computación e IA en Madrid que construye productos de IA de la idea a la demo.' }))
  const latest = posts[0]
  return (
    <main className="core">
      <div className="core-col">
        <section className="msgs" aria-label="About">
          <p className="msg">{l({ en: 'Hi, I’m Javier. I study Computer Science and AI at IE University in Madrid, and I build AI products from idea to demo.', es: 'Hola, soy Javier. Estudio Ciencias de la Computación e IA en IE University, en Madrid, y construyo productos de IA de la idea a la demo.' })}</p>
          <p className="msg">{l({ en: 'Right now: ', es: 'Ahora mismo: ' })}{now.map((n) => { const x = l(n).replace(/\.$/, ''); return x.startsWith('CTO') ? x : x[0].toLowerCase() + x.slice(1) }).join('; ')}.</p>
          <p className="msg">
            {l({ en: 'Recent work includes ', es: 'Trabajo reciente: ' })}
            <Link to="/work/los-panaderos">Los Panaderos</Link>{l({ en: ' (1st place, HackSpain 2026), ', es: ' (1.er puesto, HackSpain 2026), ' })}
            <Link to="/work/sybol-compliance-engine">{l({ en: 'an AI compliance engine for Sybol', es: 'un motor de cumplimiento con IA para Sybol' })}</Link>,{' '}
            <Link to="/work/streamscope">StreamScope</Link>{l({ en: ' (2nd of 25), and more.', es: ' (2.º de 25), y más.' })}
          </p>
        </section>

        <section className="core-index" id="work" aria-label={t('nav.work')}>
          {projects.map((p, i) => (
            <Link to={`/work/${p.slug}`} className="core-card" key={p.slug}>
              {plateSrc(p.slug) && <img src={plateSrc(p.slug)} alt="" loading="lazy" width={600} height={750} />}
              <span className="core-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="core-title">{p.title}</span>
              <span className="core-line">{l(p.tagline)}</span>
              <span className="core-meta">{l(p.badge)} · {l(p.when)}</span>
            </Link>
          ))}
        </section>

        <section className="msgs">
          <p className="msg">{l({ en: 'Smaller things I’ve built: ', es: 'Cosas más pequeñas: ' })}{builds.map((b, i) => <span key={b.title}>{i ? ', ' : ''}{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title}</a> : b.title}</span>)}.</p>
        </section>

        <section className="core-xp" id="experience" aria-label={t('xp.title')}>
          {experience.map((x, i) => (
            <div className="core-row" key={x.org + i}>
              <span className="core-num">{String(i + 1).padStart(2, '0')}</span>
              <span><b>{l(x.role)}</b><br />{x.org}</span>
              <span className="core-meta">{l(x.when)}</span>
            </div>
          ))}
        </section>

        <section className="msgs">
          {latest && <p className="msg">{l({ en: 'Latest writing: ', es: 'Lo último que escribí: ' })}<Link to={`/blog/${latest.slug}`}>{latest.title}</Link>.</p>}
          <p className="msg">{l({ en: 'My CV is ', es: 'Mi CV está ' })}<Link to="/cv">{l({ en: 'here', es: 'aquí' })}</Link>{l({ en: ', in three versions.', es: ', en tres versiones.' })}</p>
          <p className="msg" id="contact">{l({ en: 'Reach me at ', es: 'Escríbeme a ' })}<a href={`mailto:${profile.email}`}>{profile.email}</a>{l({ en: ', or on ', es: ', o en ' })}<a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>{l({ en: ' and ', es: ' y ' })}<a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>.</p>
        </section>
        <div className="core-form"><ContactForm /></div>
      </div>
    </main>
  )
}
