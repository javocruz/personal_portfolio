import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { BlogIndex, BlogPost } from './Blog'
import Lenis from 'lenis'
import { motion } from 'motion/react'
import { FlowingGradient, FilmGrain, Aurora, Grid, Vignette, ChromaFlow, MeshGradient, Dither } from 'shaders/react'
import { LazyShader } from './LazyShader'
import { profile, stats, projects, experience, skills, education, certs, type Project } from './data'

const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
}

function Cover({ kind }: { kind: Project['cover'] }) {
  if (kind === 'fruit')
    return (
      <LazyShader fallback="radial-gradient(circle at 30% 30%, #ff5b2e, #2a0d06 70%)">
        <MeshGradient stops={[{ color: '#1a0603', position: 0 }, { color: '#c7260f', position: 0.4 }, { color: '#ff5b2e', position: 0.7 }, { color: '#ffd9a0', position: 1 }]} />
        <Dither pattern="bayer4" pixelSize={3} colorB="#ffe9c9" threshold={0.55} spread={0.5} />
      </LazyShader>
    )
  if (kind === 'aero')
    return (
      <LazyShader fallback="linear-gradient(180deg, #04101a, #0f6d6d)">
        <Aurora colorA="#0a3b5c" colorB="#7dffc4" colorC="#3b6bff" intensity={85} />
        <FilmGrain strength={0.35} />
      </LazyShader>
    )
  return (
    <LazyShader fallback="linear-gradient(135deg, #0b0b12, #23233a)">
      <Grid color="#8a8aff" cells={14} thickness={1} />
      <Vignette intensity={0.9} radius={0.7} />
    </LazyShader>
  )
}

function Work({ p }: { p: Project }) {
  return (
    <motion.article className="work" {...reveal}>
      <div className="work-cover"><Cover kind={p.cover} /><span className="work-index">{p.index}</span></div>
      <div className="work-body">
        <p className="mono dim">{p.kind} · {p.year}</p>
        <h3>{p.title}</h3>
        <p className="lead">{p.blurb}</p>
        {p.points.length > 0 && <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>}
        <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
        {p.link && <a className="arrow-link" href={p.link.href} target="_blank" rel="noreferrer">{p.link.label} ↗</a>}
      </div>
    </motion.article>
  )
}

function Home() {
  return (
      <main id="top">
        <section className="hero">
          <LazyShader className="hero-bg" fallback="radial-gradient(ellipse at 70% 20%, #3a1408, #0a0908 70%)">
            <FlowingGradient colorA="#0a0908" colorB="#7a1f08" colorC="#ff5b2e" colorD="#2b1a4d" speed={0.6} distortion={0.8} />
            <ChromaFlow baseColor="#00000000" intensity={0.6} radius={2} />
            <FilmGrain strength={0.45} />
            <Vignette intensity={0.7} radius={0.9} />
          </LazyShader>
          <div className="hero-inner">
            <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
              CS & AI · {profile.location} · Open to opportunities
            </motion.p>
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
              <p>I build full-stack products and applied AI, and I know how to get people to care about them.</p>
              <div className="cta">
                <a className="btn solid" href="#work">Selected work</a>
                <a className="btn" href={`mailto:${profile.email}`}>Get in touch</a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="stats">
          {stats.map((s) => (
            <motion.div key={s.label} {...reveal}><b>{s.value}</b><span className="mono dim">{s.label}</span></motion.div>
          ))}
        </section>

        <section id="work" className="block">
          <motion.h2 {...reveal}>Selected <em>work</em></motion.h2>
          <div className="works">{projects.map((p) => <Work key={p.id} p={p} />)}</div>
        </section>

        <section id="experience" className="block">
          <motion.h2 {...reveal}>Experience</motion.h2>
          <div className="xp">
            {experience.map((x) => (
              <motion.div className="xp-row" key={x.role + x.when} {...reveal}>
                <span className="mono dim xp-when">{x.when}</span>
                <div><h3>{x.role}</h3><p className="mono dim">{x.org}</p></div>
                <p className="xp-note">{x.note}</p>
                <div className="tags">{x.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="about" className="block about">
          <motion.h2 {...reveal}>About</motion.h2>
          <div className="about-grid">
            <motion.div {...reveal}>{profile.about.map((t) => <p className="lead big" key={t}>{t}</p>)}</motion.div>
            <motion.div {...reveal} className="skills">
              {skills.map((s) => (
                <div key={s.group}><p className="mono dim">{s.group}</p><p>{s.items.join(' · ')}</p></div>
              ))}
            </motion.div>
          </div>
          <div className="edu">
            {education.map((e) => (
              <motion.div key={e.title} {...reveal}><h3>{e.title}</h3><p className="mono dim">{e.place} · {e.when}</p></motion.div>
            ))}
            <motion.div {...reveal}><p className="mono dim">Certifications</p><p>{certs.join('  /  ')}</p></motion.div>
          </div>
        </section>

        <section id="contact" className="contact">
          <LazyShader className="contact-bg" fallback="linear-gradient(180deg, #0a0908, #3a1408)">
            <FlowingGradient colorA="#0a0908" colorB="#ff5b2e" colorC="#7a1f08" colorD="#0a0908" speed={0.5} />
            <FilmGrain strength={0.5} />
          </LazyShader>
          <div className="contact-inner">
            <p className="mono">Let’s talk</p>
            <a className="mail" href={`mailto:${profile.email}`}>{profile.email}</a>
            <div className="links">
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
            </div>
          </div>
          <footer className="mono dim">© {new Date().getFullYear()} {profile.name}</footer>
        </section>
      </main>
  )
}

function Shell() {
  const { pathname } = useLocation()
  useEffect(() => { if (!location.hash) scrollTo(0, 0) }, [pathname])
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09 })
    let raf = requestAnimationFrame(function tick(t) { lenis.raf(t); raf = requestAnimationFrame(tick) })
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])

  useEffect(() => {
    const el = cursor.current
    if (!el || !matchMedia('(hover: hover)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; el.dataset.on = '1'
      el.dataset.big = (e.target as HTMLElement).closest('a,button,.work,.xp-row') ? '1' : '0' }
    const loop = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; el.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop) }
    addEventListener('mousemove', move); raf = requestAnimationFrame(loop)
    return () => { removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={cursor} className="cursor" aria-hidden />
      <header className="nav">
        <a href="/" className="logo">JCV</a>
        <nav>
          <a href="/#work">Work</a><a href="/#experience">Experience</a><Link to="/blog">Writing</Link><a href="/#contact">Contact</a>
        </nav>
      </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<Home />} />
        </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
