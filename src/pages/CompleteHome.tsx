import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { IsleHero } from '../components/IsleHero'
import { ContactForm } from '../components/ContactForm'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { reveal } from '../lib/motion'
import { profile, summary, heroLine, experience, leadership, skills, education, certs, now } from '../content/profile'
import { projects } from '../content/projects'
import { plateSet, plateSrc, ROMAN } from '../content/art'
import { Cycle } from '../components/Cycle'
import { stages } from '../content/cycle'

const side = (i: number) => stages[i].textSide

/**
 * Complete: the hero and home are about Javier; the projects live as paintings in the gallery (/work).
 * Behind it all, Cole's The Course of Empire plays out as you scroll (see Cycle), ending on the hero's isle of the dead.
 */
export default function CompleteHome() {
  const { t, l } = useI18n()
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(profile.email).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  useHead('Javier Cruz Villarreal — CS & AI', l(summary))
  const featured = projects.filter((p) => p.featured).slice(0, 3)
  return (
    <main id="top" className="complete cyc-home">
      <Cycle />
      <IsleHero>
        <div className="isle-text">
          <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>{t('hero.kicker')}</motion.p>
          <h1>
            {['Javier', 'Cruz', 'Villarreal'].map((w, i) => (
              <span className="line" key={w}><motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>{i === 2 ? <em>{w}</em> : w}</motion.span></span>
            ))}
          </h1>
          <motion.p className="isle-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}>{l(heroLine)}</motion.p>
          <motion.div className="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}>
            <Link className="btn solid" to="/work">{l({ en: 'Enter the gallery', es: 'Entrar a la galería' })}</Link>
            <a className="btn" href="#contact">{t('hero.cta2')}</a>
          </motion.div>
        </div>
      </IsleHero>

      <section id="about" className="cyc-sec" data-cycle="1" data-side={side(1)}>
        <div className="cyc-panel">
          <motion.div {...reveal}>
            <p className="kicker">{t('about.title')}</p>
            <p className="lead big" style={{ marginTop: 18 }}>{l(summary)}</p>
            <p className="kicker" style={{ marginTop: 40 }}>{t('now.title')}</p>
            <ul className="now-list">{now.map((n, i) => <li key={i}>{l(n)}</li>)}</ul>
          </motion.div>
        </div>
      </section>

      <section id="experience" className="cyc-sec" data-cycle="2" data-side={side(2)}>
        <div className="cyc-panel">
          <motion.h2 {...reveal}>{t('xp.title')}</motion.h2>
          <div className="xp">
            {experience.map((x) => (
              <motion.div className="xp-row" key={x.org + x.role.en} {...reveal}>
                <span className="mono dim xp-when">{l(x.when)}</span>
                <div><h3>{l(x.role)}</h3><p className="mono dim">{x.org}</p></div>
                <ul className="xp-note">{x.bullets.map((b, i) => <li key={i}>{l(b)}</li>)}</ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="cyc-sec cyc-wide" data-cycle="3" data-side={side(3)}>
        <div className="cyc-panel">
          <motion.h2 {...reveal}>{l({ en: 'From the', es: 'De la' })} <em>{l({ en: 'gallery', es: 'galería' })}</em></motion.h2>
          <div className="teaser">
            {featured.map((p, i) => (
              <motion.figure key={p.slug} className="plate" {...reveal}>
                <Link to={`/work/${p.slug}`} className="frame-art"><img src={plateSrc(p.slug)} srcSet={plateSet(p.slug)} sizes="(max-width: 900px) 92vw, 20vw" alt={p.title} loading="lazy" width={600} height={750} /></Link>
                <figcaption className="wall"><b>{l({ en: 'Plate', es: 'Lámina' })} {ROMAN[i]}</b> · {p.title}<br /><span className="dim">{l(p.badge)}</span></figcaption>
              </motion.figure>
            ))}
          </div>
          <Link className="btn wide-btn" to="/work">{l({ en: 'Enter the gallery', es: 'Entrar a la galería' })} →</Link>
        </div>
      </section>

      <section className="cyc-sec cyc-mid" data-cycle="4" data-side={side(4)}>
        <div className="cyc-panel">
          <motion.h2 {...reveal}>{t('lead.title')}</motion.h2>
          <div className="lead-grid">
            {leadership.map((x) => (
              <motion.div key={x.title} {...reveal}>
                <p className="mono dim">{l(x.when)}</p><h3>{x.title}</h3><p className="mono dim">{x.org}</p><p className="lead">{l(x.text)}</p>
              </motion.div>
            ))}
          </div>
          <div className="edu">
            {skills.slice(0, 3).map((s) => <motion.div key={s.group.en} {...reveal}><p className="mono dim">{l(s.group)}</p><p>{s.items.join(' · ')}</p></motion.div>)}
            {education.map((e) => <motion.div key={e.place} {...reveal}><h3>{l(e.title)}</h3><p className="mono dim">{e.place} · {l(e.when)}</p></motion.div>)}
            <motion.div {...reveal}><p className="mono dim">{t('certs.title')}</p><p>{certs.join('  /  ')}</p></motion.div>
          </div>
        </div>
      </section>

      {/* a quiet beat: the ruins get the screen to themselves */}
      <section className="cyc-quiet" data-cycle="5" aria-hidden />

      <section id="contact" className="reach" data-cycle="6">
        <div className="reach-text">
          <p className="kicker">{l({ en: 'Contact', es: 'Contacto' })}</p>
          <h2 className="reach-title">{l({ en: 'Let’s talk.', es: 'Hablemos.' })}</h2>
          <p className="reach-lead">{l({ en: 'Have a project, a role or an idea? Write to me. Every message comes straight to my inbox.', es: '¿Tienes un proyecto, un puesto o una idea? Escríbeme. Cada mensaje llega directo a mi correo.' })}</p>
          <div className="reach-mail">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button onClick={copy}>{copied ? l({ en: 'Copied', es: 'Copiado' }) : l({ en: 'Copy', es: 'Copiar' })}</button>
          </div>
          <div className="reach-actions">
            <a className="btn solid" href={`mailto:${profile.email}`}>{l({ en: 'Email me', es: 'Escríbeme' })}</a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="btn" href={profile.cv} download>{l({ en: 'Download CV', es: 'Descargar CV' })} ↓</a>
          </div>
          <div className="reach-form">
            <p className="kicker">{l({ en: 'Or send a message from here', es: 'O envía un mensaje desde aquí' })}</p>
            <ContactForm />
          </div>
        </div>
        <figure className="reach-eye">
          <img src="/art/eye-of-nature.jpg" alt="Eye of Nature by Dan Hillier" loading="lazy" decoding="async" width={719} height={861} />
          <figcaption>Eye of Nature · Dan Hillier</figcaption>
        </figure>
        <footer className="reach-foot dim">© {new Date().getFullYear()} {profile.name} · {t('footer.built')} · {l({ en: 'Paintings: Thomas Cole, The Course of Empire (1836), and Arnold Böcklin, Isle of the Dead (1883), both public domain · Eye of Nature by Dan Hillier', es: 'Pinturas: Thomas Cole, El curso del imperio (1836), y Arnold Böcklin, La isla de los muertos (1883), ambas de dominio público · Eye of Nature de Dan Hillier' })}</footer>
      </section>
    </main>
  )
}
