import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '@fontsource/jost/latin-300.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/latin-500.css'
import { ContactForm } from '../components/ContactForm'
import { CursorTrail } from '../components/CursorTrail'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { useCoreStyle, type CoreStyle } from '../lib/coreStyle'
import { profile, experience } from '../content/profile'
import { projects, builds } from '../content/projects'
import { paintingSrc, plateSrc, plateSet, plateBySlug, plateName } from '../content/art'
import { posts } from '../posts'
import { NOTES, type NoteId } from '../lab/art/notes'

/** The painting's caption for a project in the active style. */
const noteFor = (slug: string, style: CoreStyle) => { const id = plateBySlug[slug]?.id as NoteId | undefined; return id ? NOTES[style][id] : undefined }

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

const source: Record<CoreStyle, () => Promise<{ default: string }>> = {
  mondrian: () => import('../lab/art/plates-mondrian.ts?raw'),
  rothko: () => import('../lab/art/plates-rothko.ts?raw'),
}

/**
 * "Technique": a wall placard for the paintings. The steps in words, then each plate's real source beside the painting
 * as it stood after every layer() step, for the active style. Those in-between paintings were pre-rendered too, so
 * nothing paints in the browser. The source and images load only when the placard is opened.
 */
function Technique() {
  const { l } = useI18n()
  const { style } = useCoreStyle()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState<Partial<Record<CoreStyle, string>>>({})
  const [pick, setPick] = useState(projects[0].slug)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const codeBox = useRef<HTMLDivElement>(null)
  // fetch the active style's source when the placard is opened, and again if the style changes while it's open
  useEffect(() => {
    if (!open || code[style]) return
    source[style]().then((m) => { setCode((c) => ({ ...c, [style]: m.default })); setStep(0); setPlaying(true) })
  }, [open, style, code])
  useEffect(() => { if (open) { setStep(0); setPlaying(true) } }, [style])
  const id = plateBySlug[pick]?.id
  const src = (code[style]?.match(new RegExp(`// <plate:${id}>([\\s\\S]*?)// </plate:${id}>`)) ?? [])[1]?.trim() ?? ''
  const blocks = steps(src)
  const n = blocks.length - 1
  const name = plateName(pick, style)
  const img = (k: number) => (k === n ? paintingSrc(name, 600) : `/art/paintings/${name}-l${k}-600.jpg`)

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
  const artist = style === 'mondrian'
    ? l({ en: 'Paint it like Mondrian: split the canvas into planes, give a few of them flat red, blue or yellow, and hold it all together with thick black lines. The numbers only set which plane is red and how big it is. Plain Canvas 2D, one layer at a time.', es: 'Píntalo como Mondrian: divide el lienzo en planos, dale a algunos rojo, azul o amarillo planos y sostenlo todo con líneas negras gruesas. Los números solo deciden qué plano es rojo y qué tan grande es. Canvas 2D simple, capa por capa.' })
    : l({ en: 'Paint it like Rothko: over a stained ground, stack dozens of thin glazes for each field until its edges glow and dissolve. The numbers only set how tall each field is and which colours sit together. Plain Canvas 2D, one layer at a time.', es: 'Píntalo como Rothko: sobre un fondo manchado, apila decenas de veladuras delgadas en cada campo hasta que sus bordes brillen y se disuelvan. Los números solo deciden qué tan alto es cada campo y qué colores van juntos. Canvas 2D simple, capa por capa.' })
  const note = noteFor(pick, style)
  return (
    <details className="one-recipe" onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>{l({ en: 'Every painting above was generated with JavaScript. ', es: 'Cada pintura de arriba se generó con JavaScript. ' })}<u>{l({ en: 'Technique', es: 'Técnica' })}</u></summary>
      <ol>
        <li>{l({ en: 'Start from the project’s real numbers: two forecast errors, 1.50 and 1.29 °C; a fire seen 12 steps late; one critical finding in a ledger. They nudge the painting, they don’t draw it.', es: 'Parte de los números reales del proyecto: dos errores de pronóstico, 1.50 y 1.29 °C; un incendio visto 12 pasos tarde; un hallazgo crítico en un registro. Empujan la pintura, no la dibujan.' })}</li>
        <li>{artist}</li>
        <li>{l({ en: 'Seed the randomness so the same code paints the same picture every time, then keep the strongest of 24 seeds.', es: 'Fija la semilla del azar para que el mismo código pinte siempre el mismo cuadro, y quédate con la mejor de 24 semillas.' })}</li>
        <li>{l({ en: 'Paint once, save it as a JPG, and serve the image. Nothing is painted in your browser.', es: 'Píntalo una vez, guárdalo como JPG y sirve la imagen. Nada se pinta en tu navegador.' })}</li>
      </ol>
      <div className="one-recipe-tabs" role="tablist">
        {projects.filter((p) => plateBySlug[p.slug]).map((p) => (
          <button key={p.slug} role="tab" aria-selected={pick === p.slug} onClick={() => choose(p.slug)}>{p.title}</button>
        ))}
      </div>
      {note && <p className="one-recipe-note">{l(note)}</p>}
      {code[style] && (
        <div className="one-split">
          <div className="one-split-code" ref={codeBox}>
            {blocks.map((b, k) => (
              <button key={style + pick + k} className="one-block" data-state={k === 0 || k < step ? 'done' : k === step ? 'cur' : 'todo'} data-cur={k === step || undefined}
                onClick={() => { setPlaying(false); setStep(k) }} disabled={k === 0}>
                {b.label && <span className="one-block-label">{String(k).padStart(2, '0')} · {b.label}</span>}
                <code>{b.code}</code>
              </button>
            ))}
          </div>
          <div className="one-split-art">
            {blocks.slice(1).map((_, i) => <img key={style + pick + i} src={img(i + 1)} alt="" width={600} height={750} style={{ opacity: i + 1 <= step ? 1 : 0 }} />)}
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

/**
 * A project painting in the active style. When the style changes, the new picture fades in over the old one (about
 * 400ms) once it has loaded; the old one stays underneath until then, so nothing flashes or shifts.
 */
function Plate({ slug, style }: { slug: string; style: CoreStyle }) {
  const want = { src: plateSrc(slug, 600, style), set: plateSet(slug, style) }
  const [cur, setCur] = useState(want)
  const [old, setOld] = useState<typeof want | null>(null)
  const [ready, setReady] = useState(true)
  useEffect(() => {
    if (want.src === cur.src) return
    setOld(cur); setCur(want); setReady(false)
  }, [want.src])
  useEffect(() => {
    if (!ready || !old) return
    const t = setTimeout(() => setOld(null), 420)
    return () => clearTimeout(t)
  }, [ready, old])
  const sizes = '(max-width: 720px) 100vw, 340px'
  return (
    <>
      {old && <img className="is-old" src={old.src} srcSet={old.set} sizes={sizes} alt="" width={600} height={750} />}
      <img key={cur.src} className={old ? 'is-new' : undefined} src={cur.src} srcSet={cur.set} sizes={sizes} alt="" loading="lazy" width={600} height={750}
        data-loading={ready ? undefined : ''} onLoad={() => setReady(true)} />
    </>
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
 * No shaders; the project paintings are pre-rendered images, lazy-loaded, in the active Core style.
 */
export default function CoreHome() {
  const { l, lang } = useI18n()
  const { style } = useCoreStyle()
  const time = useMadridTime()
  useHead('Javier Cruz Villarreal · CS & AI', l({ en: 'Computer Science & AI student in Madrid who builds AI products from idea to demo.', es: 'Estudiante de Ciencias de la Computación e IA en Madrid que construye productos de IA de la idea a la demo.' }))
  const date = (d: string) => new Date(d).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const facts: [string, string][] = [
    [l({ en: 'Based', es: 'Vivo en' }), 'Madrid'],
    [l({ en: 'Studying', es: 'Estudio' }), l({ en: 'CS & AI, IE University, ’28', es: 'CC e IA, IE University, ’28' })],
    [l({ en: 'Latest', es: 'Lo más reciente' }), l({ en: 'SnapFrost, 1st Madrid', es: 'SnapFrost, 1er lugar Madrid' })],
    [l({ en: 'CTO', es: 'CTO' }), 'Hospitia'],
    [l({ en: 'Speaks', es: 'Hablo' }), l({ en: 'Spanish, English', es: 'Español, inglés' })],
  ]
  // Mondrian: the fact under the current Madrid hour gets a block of colour, so the grid changes through the day
  const hour = parseInt(time, 10) || 0
  const hot = { cell: hour % facts.length, colour: (['red', 'blue', 'yellow'] as const)[hour % 3] }

  return (
    <main className="one">

      <section className="one-intro" id="about">
        <p>{l({ en: 'I study Computer Science and AI in Madrid and build AI products from idea to demo. Mostly compliance, vision and agents, usually as the person closest to the customer.', es: 'Estudio Ciencias de la Computación e IA en Madrid y construyo productos de IA de la idea a la demo. Sobre todo cumplimiento normativo, visión y agentes, normalmente como la persona más cercana al cliente.' })}</p>
      </section>

      <dl className="one-facts">
        {facts.map(([k, v], i) => <div key={k} data-hot={i === hot.cell ? hot.colour : undefined}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <section className="one-sec" id="work">
        <h2>{l({ en: 'Projects', es: 'Proyectos' })} <sup>{projects.length}</sup></h2>
        <div className="one-grid">
          {projects.map((p, i) => (
            <Link to={`/work/${p.slug}`} className="one-card" key={p.slug} data-c={i % 3} data-k={i % 4}>
              <div className="one-art">
                <Plate slug={p.slug} style={style} />
                {noteFor(p.slug, style) && <span className="one-art-note">{l(noteFor(p.slug, style)!)}</span>}
              </div>
              <span className="one-t">{p.title}</span>
              <span className="one-d">{l(p.tagline)}</span>
              <span className="one-m">{l(p.badge)} · {l(p.when)}</span>
            </Link>
          ))}
        </div>
        <p className="one-after">{l({ en: 'Also: ', es: 'También: ' })}{builds.map((b, i) => <span key={b.title}>{i ? ', ' : ''}{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title}</a> : b.title}</span>)}.</p>
        <Technique />
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
      </section>

      <section className="one-sec">
        <h2>{l({ en: 'Writing', es: 'Escritos' })} <sup>{posts.length}</sup></h2>
        {posts.length ? (
          <ul className="one-rows">
            {posts.map((p) => <li key={p.slug}><Link to={`/blog/${p.slug}`}><span className="one-t">{p.title}</span><span className="one-d" /><span className="one-m">{date(p.date)}</span></Link></li>)}
          </ul>
        ) : <p className="one-after one-dim">{l({ en: 'First post soon.', es: 'Pronto, la primera entrada.' })}</p>}
      </section>

      <section className="one-sec" id="contact">
        <h2>{l({ en: 'Contact', es: 'Contacto' })}</h2>
        <a className="one-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
        <div className="one-social">
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden>↗</span></a>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden>↗</span></a>
          <a href={profile.cv} download>{l({ en: 'Download CV (PDF)', es: 'Descargar CV (PDF)' })} <span aria-hidden>↓</span></a>
        </div>
        <div className="one-form">
          <p className="one-dim">{l({ en: 'Or write here', es: 'O escríbeme aquí' })}</p>
          <ContactForm />
        </div>
      </section>

      <footer className="one-foot">
        <span>© 2026 · {l({ en: 'Core styles after Piet Mondrian and Mark Rothko. Every painting here is code.', es: 'Estilos de Core inspirados en Piet Mondrian y Mark Rothko. Cada pintura aquí es código.' })}</span>
        <span>{l({ en: 'Hand-made in Madrid', es: 'Hecho a mano en Madrid' })} · {time}</span>
      </footer>

      <CursorTrail style={style} />
    </main>
  )
}
