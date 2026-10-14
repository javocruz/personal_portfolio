import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EyeOfNature } from '../art/EyeOfNature'
import { ContactForm } from '../../components/ContactForm'
import { profile } from '../../content/profile'
import { BackToLab, LayoutNav, ROMAN, plateFor } from './bits'

/** One long scroll across the water. The painting grows as you approach; a boat on the waterline tracks progress. */
export default function LayoutB() {
  const img = useRef<HTMLImageElement>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const k = Math.min(1, Math.max(0, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)))
      setP(k)
      if (img.current) img.current.style.transform = `translate(-50%,-52%) scale(${0.46 + k * 1.1}) translateY(${(1 - k) * 8}%)`
    }
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return (
    <div className="lab" style={{ background: '#05060d' }}>
      <LayoutNav items={[['#ch0', 'Voyage'], ['#arrive', 'Arrive'], ['/blog', 'Journal'], ['/cv', 'CV']]} />
      <BackToLab />
      <div className="sea"><img ref={img} src="/lab/isle.jpg" alt="" /><div className="tint" /></div>

      <section className="chapter" id="ch0" style={{ minHeight: '100svh', alignItems: 'flex-end', paddingBottom: '14vh' }}>
        <div className="title-over" style={{ position: 'relative', textAlign: 'left' }}>
          <h1>Javier Cruz <em style={{ color: '#e8b04a' }}>Villarreal</em></h1>
          <p>Scroll to row toward the isle</p>
        </div>
      </section>

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const { project: pr } = plateFor(i)
        return (
          <section key={i} className={`chapter ${i % 2 ? 'r' : ''}`}>
            <div className="card">
              <p className="kicker">Chapter {ROMAN[i]} · {pr.when.en}</p>
              <h2>{pr.title}</h2>
              <p>{pr.tagline.en}</p>
              <p className="wall dim" style={{ marginTop: 12 }}>{pr.badge.en}</p>
              <Link className="enter" to={`/work/${pr.slug}`}>Land here →</Link>
            </div>
          </section>
        )
      })}

      <section className="chapter" id="arrive" style={{ minHeight: '120vh', flexDirection: 'column', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}><EyeOfNature rays={900} arc={[180, 360]} cx={0.5} cy={0.42} eyeSize={0.05} reach={0.5} palette="gold" seed={5} /></div>
        <p className="kicker">Arrival</p>
        <p className="big" style={{ textAlign: 'center' }}><a href={`mailto:${profile.email}`} style={{ borderBottom: '1px solid #e8b04a' }}>{profile.email}</a></p>
        <div className="stage card" style={{ width: 'min(680px,100%)', textAlign: 'left' }}><ContactForm /></div>
      </section>

      <div className="boatline"><svg className="boat" style={{ left: `calc(${p * 100}% - 15px)` }} viewBox="0 0 30 14"><path d="M1 6h28l-5 7H6z" fill="#efe7d8" /><path d="M14 6V1l5 5z" fill="#e8b04a" /></svg></div>
    </div>
  )
}
