import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { InkTrail } from '../components/InkTrail'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { useMode } from '../lib/mode'
import { profile, experience } from '../content/profile'
import { projects, builds } from '../content/projects'
import { paintingSrc, plateSrc, plateSet, plateBySlug } from '../content/art'
import { posts } from '../posts'

/** Splits a plate's source at its layer('…') calls: a header, then one block of code per step. */
function steps(src: string) {
  const out: { label: string; code: string }[] = [{ label: '', code: '' }]
  for (const line of src.split('\n')) {
    const m = line.match(/^\s*layer\('(.+?)'\)/)
    if (m) out.push({ label: m[1], code: line })
    else out[out.length - 1].code += (out[out.length - 1].code ? '\n' : '') + line
  }
  return out
}

/**
 * "Recipe" for the paintings: the steps in words, then each plate's real source beside the painting as it stood after
 * every layer() step. Those in-between paintings were pre-rendered too, so nothing paints in the browser. The source
 * and images load only when the recipe is opened.
 */
function Recipe() {
  const { l } = useI18n()
  const [code, setCode] = useState('')
  const [pick, setPick] = useState(projects[0].slug)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const codeBox = useRef<HTMLDivElement>(null)
  const load = () => { if (!code) import('../lab/art/plates.ts?raw').then((m) => { setCode(m.default); setStep(0); setPlaying(true) }) }
  const id = plateBySlug[pick]?.id
  const src = (code.match(new RegExp(`// <plate:${id}>([\\s\\S]*?)// </plate:${id}>`)) ?? [])[1]?.trim() ?? ''
  const blocks = steps(src)
  const n = blocks.length - 1
  const img = (k: number) => (k === n ? paintingSrc(`plate-${id}`, 600) : `/art/paintings/plate-${id}-l${k}-600.jpg`)

  // play through the layers one by one
  useEffect(() => {
    if (!playing) return
    if (step >= n) { setPlaying(false); return }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 1300)
    return () => clearTimeout(t)
  }, [playing, step, n])
  // keep the current block in view inside the code panel (without scrolling the page)
  useEffect(() => {
    const box = codeBox.current, cur = box?.querySelector<HTMLElement>('[data-cur]')
    if (box && cur) box.scrollTo({ top: cur.offsetTop - 40, behavior: 'smooth' })
  }, [step, pick])

  const choose = (slug: string) => { setPick(slug); setStep(0); setPlaying(true) }
  return (
    <details className="one-recipe" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && load()}>
      <summary>{l({ en: 'Every painting above was generated with JavaScript. ', es: 'Cada pintura de arriba se generó con JavaScript. ' })}<u>{l({ en: 'The recipe', es: 'La receta' })}</u></summary>
      <ol>
        <li>{l({ en: 'Pick one real number from the project: a fire spreading with the wind, a cost falling from $633 to $29, a score from deepfake to authentic.', es: 'Elige un número real del proyecto: un fuego que avanza con el viento, un coste que cae de 633 $ a 29 $, una puntuación de deepfake a auténtico.' })}</li>
        <li>{l({ en: 'Draw it with p5.brush: watercolour washes, charcoal, pastel and pen on one WebGL canvas, one layer at a time.', es: 'Dibújalo con p5.brush: aguadas de acuarela, carboncillo, pastel y pluma sobre un único lienzo WebGL, capa a capa.' })}</li>
        <li>{l({ en: 'Seed the randomness so the same code paints the same picture every time.', es: 'Fija la semilla del azar para que el mismo código pinte siempre el mismo cuadro.' })}</li>
        <li>{l({ en: 'Paint once, save it as a JPG, and serve the image. Nothing is painted in your browser.', es: 'Píntalo una vez, guárdalo como JPG y sirve la imagen. Nada se pinta en tu navegador.' })}</li>
      </ol>
      <div className="one-recipe-tabs" role="tablist">
        {projects.filter((p) => plateBySlug[p.slug]).map((p) => (
          <button key={p.slug} role="tab" aria-selected={pick === p.slug} onClick={() => choose(p.slug)}>{p.title}</button>
        ))}
      </div>
      {code && (
        <div className="one-split">
          <div className="one-split-code" ref={codeBox}>
            {blocks.map((b, k) => (
              <button key={pick + k} className="one-block" data-state={k === 0 || k < step ? 'done' : k === step ? 'cur' : 'todo'} data-cur={k === step || undefined}
                onClick={() => { setPlaying(false); setStep(k) }} disabled={k === 0}>
                {b.label && <span className="one-block-label">{String(k).padStart(2, '0')} · {b.label}</span>}
                <code>{b.code}</code>
              </button>
            ))}
          </div>
          <div className="one-split-art">
            {blocks.slice(1).map((_, i) => <img key={pick + i} src={img(i + 1)} alt="" style={{ opacity: i + 1 <= step ? 1 : 0 }} />)}
            <div className="one-split-bar">
              <span>{step ? `${l({ en: 'Layer', es: 'Capa' })} ${step}/${n} · ${blocks[step].label}` : l({ en: 'Blank paper', es: 'Papel en blanco' })}</span>
              <button onClick={() => { setStep(0); setPlaying(true) }}>{l({ en: 'Replay', es: 'Repetir' })}</button>
            </div>
          </div>
        </div>
      )}
    </details>
  )
}

/** Madrid time, ticking once a minute. */
function useMadridTime() {
  const fmt = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })
  const [t, setT] = useState(fmt)
  useEffect(() => { const id = setInterval(() => setT(fmt()), 30_000); return () => clearInterval(id) }, [])
  return t
}

/**
 * Core: everything on one page (the dimden.dev idea), set like a studio index: white, small type, hairlines.
 * No shaders; the project paintings are pre-rendered images, lazy-loaded.
 */
export default function CoreHome() {
  const { l, lang, setLang } = useI18n()
  const { setMode } = useMode()
  const time = useMadridTime()
  useHead('Javier Cruz Villarreal — CS & AI', l({ en: 'Computer Science & AI student in Madrid who builds AI products from idea to demo.', es: 'Estudiante de Ciencias de la Computación e IA en Madrid que construye productos de IA de la idea a la demo.' }))
  const date = (d: string) => new Date(d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

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
        <div className="one-grid">
          {projects.map((p) => (
            <Link to={`/work/${p.slug}`} className="one-card" key={p.slug}>
              <div className="one-art"><img src={plateSrc(p.slug)} srcSet={plateSet(p.slug)} sizes="(max-width: 720px) 100vw, 340px" alt="" loading="lazy" width={600} height={750} /></div>
              <span className="one-t">{p.title}</span>
              <span className="one-d">{l(p.tagline)}</span>
              <span className="one-m">{l(p.badge)} · {l(p.when)}</span>
            </Link>
          ))}
        </div>
        <p className="one-after">{l({ en: 'Also: ', es: 'También: ' })}{builds.map((b, i) => <span key={b.title}>{i ? ', ' : ''}{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title}</a> : b.title}</span>)}.</p>
        <Recipe />
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
        <div className="one-social">
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden>↗</span></a>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden>↗</span></a>
        </div>
        <div className="one-form">
          <p className="one-dim">{l({ en: 'Or write here', es: 'O escribe aquí' })}</p>
          <ContactForm />
        </div>
      </section>

      <footer className="one-foot"><span>© 2026</span><span>{l({ en: 'Hand-made in Madrid', es: 'Hecho a mano en Madrid' })}</span></footer>

      <InkTrail />
    </main>
  )
}
