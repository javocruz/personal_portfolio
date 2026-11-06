import type { ReactNode } from 'react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { certs, education, experience, leadership, profile, skills, stats, summary } from '../content/profile'
import { ContactForm } from '../components/ContactForm'

/** One section: a quiet label on the left, the list on the right. */
function Sec({ title, order, id, children }: { title: string; order: number; id?: string; children: ReactNode }) {
  return (
    <section className="sa-sec" id={id} data-block style={{ ['--order' as string]: order }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}

/** A row that opens to show the detail. */
function Row({ title, sub, when, children }: { title: string; sub: string; when: string; children: ReactNode }) {
  return (
    <details className="sa-row">
      <summary><span><b>{title}</b> <i>{sub}</i></span><time>{when}</time></summary>
      {children}
    </details>
  )
}

/** About: who I am, what I've done, and how to reach me, as plain lists. */
export default function SiteAbout() {
  const { l } = useI18n()
  useHead('About · Javier Cruz Villarreal', l({ en: 'Experience, education, skills and how to reach me.', es: 'Experiencia, educación, habilidades y cómo contactarme.' }))
  return (
    <main className="site-main site-about">
      <p className="sa-bio" data-block style={{ ['--order' as string]: 0 }}>{l(summary)}</p>
      <Sec title={l({ en: 'experience', es: 'experiencia' })} order={1}>
        {experience.map((x) => (
          <Row key={x.org + l(x.when)} title={l(x.role)} sub={x.org} when={l(x.when)}>
            <ul>{x.bullets.map((b) => <li key={b.en}>{l(b)}</li>)}</ul>
          </Row>
        ))}
      </Sec>
      <Sec title={l({ en: 'leadership', es: 'liderazgo' })} order={2}>
        {leadership.map((x) => <Row key={x.title} title={x.title} sub={x.org} when={l(x.when)}><p>{l(x.text)}</p></Row>)}
      </Sec>
      <Sec title={l({ en: 'recognition', es: 'reconocimientos' })} order={3}>
        <ul className="sa-list">{stats.map((s) => <li key={s.value + s.label.en}><b>{s.value}</b> <span>{l(s.label)}</span></li>)}</ul>
      </Sec>
      <Sec title={l({ en: 'education', es: 'educación' })} order={4}>
        <ul className="sa-list">{education.map((e) => <li key={e.place}><b>{l(e.title)}</b> <span>{e.place} · {l(e.when)}</span></li>)}</ul>
      </Sec>
      <Sec title={l({ en: 'skills', es: 'habilidades' })} order={5}>
        <ul className="sa-list">
          {skills.map((s) => <li key={s.group.en}><b>{l(s.group)}</b> <span>{s.items.join(' · ')}</span></li>)}
          <li><b>{l({ en: 'Certificates', es: 'Certificados' })}</b> <span>{certs.join(' · ')}</span></li>
        </ul>
      </Sec>
      <Sec title={l({ en: 'contact', es: 'contacto' })} order={6} id="contact">
        <p className="sa-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a> / <a href={profile.github} target="_blank" rel="noreferrer">github</a> / <a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin</a> / <a href={profile.cv} download>cv</a>
        </p>
        <div className="home-form"><ContactForm /></div>
      </Sec>
    </main>
  )
}
