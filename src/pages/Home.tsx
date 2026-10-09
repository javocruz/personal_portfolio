import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Scene } from '../components/Scene'
import { ProjectCard } from '../components/ProjectCard'
import { ContactForm } from '../components/ContactForm'
import { Now } from '../components/Now'
import { useI18n } from '../lib/i18n'
import { useFx } from '../lib/fx'
import { useHead } from '../lib/head'
import { reveal } from '../lib/motion'
import { profile, summary, heroLine, stats, workedWith, experience, leadership, skills, education, certs, testimonials } from '../content/profile'
import { projects, builds } from '../content/projects'

export default function Home() {
  const { t, l } = useI18n()
  const { hyper } = useFx()
  useHead('Javier Cruz Villarreal — CS & AI', l(summary))
  const featured = projects.filter((p) => p.featured)
  return (
    <main id="top">
      <section className="hero stage">
        <Scene name={hyper ? 'hyper' : 'hero'} className="hero-bg" />
        <div className="hero-inner">
          <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>{t('hero.kicker')}</motion.p>
          <h1>
            {['Javier', 'Cruz', 'Villarreal'].map((w, i) => (
              <span className="line" key={w}>
                <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
                  {i === 1 ? <em>{w}</em> : w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div className="hero-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}>
            <p>{l(heroLine)}</p>
            <div className="cta">
              <Link className="btn solid" to="/work">{t('hero.cta1')}</Link>
              <a className="btn" href="#contact">{t('hero.cta2')}</a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="strip" aria-label={t('strip.label')}>
        <span className="mono dim strip-label">{t('strip.label')}</span>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...workedWith, ...workedWith].map((w, i) => <span key={i}>{w}</span>)}
          </div>
        </div>
        <ul className="sr-only">{workedWith.map((w) => <li key={w}>{w}</li>)}</ul>
      </section>

      <section className="stats">
        {stats.map((s) => (
          <motion.div key={s.value} {...reveal}><b>{s.value}</b><span className="mono dim">{l(s.label)}</span></motion.div>
        ))}
      </section>

      <section id="work" className="block">
        <motion.h2 {...reveal}>{t('work.title1')} <em>{t('work.title2')}</em></motion.h2>
        <div className="works">{featured.map((p) => <ProjectCard key={p.slug} p={p} />)}</div>
        <Link className="btn wide-btn" to="/work">{t('work.all')} →</Link>
      </section>

      <section id="experience" className="block">
        <motion.h2 {...reveal}>{t('xp.title')}</motion.h2>
        <div className="xp">
          {experience.map((x) => (
            <motion.div className="xp-row" key={x.org + x.role.en} {...reveal}>
              <span className="mono dim xp-when">{l(x.when)}</span>
              <div><h3>{l(x.role)}</h3><p className="mono dim">{x.org}</p></div>
              <ul className="xp-note">{x.bullets.map((b, i) => <li key={i}>{l(b)}</li>)}</ul>
              <div className="tags">{x.tags.map((g) => <span key={g}>{g}</span>)}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="leadership" className="block">
        <motion.h2 {...reveal}>{t('lead.title')}</motion.h2>
        <div className="lead-grid">
          {leadership.map((x) => (
            <motion.div key={x.title} {...reveal}>
              <p className="mono dim">{l(x.when)}</p>
              <h3>{x.title}</h3>
              <p className="mono dim">{x.org}</p>
              <p className="lead">{l(x.text)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="block">
        <motion.h2 {...reveal}>{t('builds.title')}</motion.h2>
        <p className="lead sub">{t('builds.sub')}</p>
        <div className="builds">
          {builds.map((b) => (
            <motion.div className="build" key={b.title} {...reveal}>
              <p className="mono dim">{b.when}</p>
              <h3>{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title} ↗</a> : b.title}</h3>
              <p>{l(b.text)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="block"><motion.div {...reveal}><Now /></motion.div></section>

      {testimonials.length > 0 && (
        <section className="block">
          <motion.h2 {...reveal}>{t('testi.title')}</motion.h2>
          <div className="testis">
            {testimonials.map((q) => (
              <motion.figure key={q.name} {...reveal}>
                <blockquote>“{l(q.quote)}”</blockquote>
                <figcaption className="mono dim">{q.name} · {q.role}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>
      )}

      <section id="about" className="block about">
        <motion.h2 {...reveal}>{t('about.title')}</motion.h2>
        <div className="about-grid">
          <motion.div {...reveal}><p className="lead big">{l(summary)}</p></motion.div>
          <motion.div {...reveal} className="skills">
            {skills.map((s) => (
              <div key={s.group.en}><p className="mono dim">{l(s.group)}</p><p>{s.items.join(' · ')}</p></div>
            ))}
          </motion.div>
        </div>
        <div className="edu">
          {education.map((e) => (
            <motion.div key={e.place} {...reveal}><h3>{l(e.title)}</h3><p className="mono dim">{e.place} · {l(e.when)}</p></motion.div>
          ))}
          <motion.div {...reveal}><p className="mono dim">{t('certs.title')}</p><p>{certs.join('  /  ')}</p></motion.div>
        </div>
      </section>

      <section id="contact" className="contact stage">
        <Scene name="contact" className="contact-bg" />
        <div className="contact-inner">
          <p className="mono">{t('contact.kicker')}</p>
          <ContactForm />
          <p className="mono contact-or">{t('contact.or')} <a className="mail" href={`mailto:${profile.email}`}>{profile.email}</a></p>
          <div className="links">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <Link to="/cv">{t('nav.cv')} →</Link>
          </div>
        </div>
        <footer className="mono dim">© {new Date().getFullYear()} {profile.name} · {t('footer.built')}</footer>
      </section>
    </main>
  )
}
