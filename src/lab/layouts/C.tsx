import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EyeOfNature } from '../art/EyeOfNature'
import { Painting } from '../art/Painting'
import { loadRef, makePortrait, type Ref } from '../art/portrait'
import { PLATES } from '../art/plates'
import { ContactForm } from '../../components/ContactForm'
import { experience, profile } from '../../content/profile'
import { BackToLab, LayoutNav, ROMAN, plateFor } from './bits'

/** Typographic index. The art stays out of the way until you hover a row, then a painted plate follows the cursor. */
export default function LayoutC() {
  const plate = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [ref, setRef] = useState<Ref | null>(null)
  useEffect(() => { loadRef().then(setRef) }, [])
  useEffect(() => {
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY }
    const loop = () => { cx += (x - cx) * 0.14; cy += (y - cy) * 0.14; if (plate.current) plate.current.style.transform = `translate(${cx + 28}px,${cy - 150}px)`; raf = requestAnimationFrame(loop) }
    addEventListener('mousemove', move); raf = requestAnimationFrame(loop)
    return () => { removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div className="lab">
      <LayoutNav items={[['#index', 'Index'], ['#about', 'About'], ['/blog', 'Journal'], ['/cv', 'CV']]} />
      <BackToLab />
      <section className="sect" style={{ paddingTop: 'clamp(120px,16vw,200px)', paddingBottom: 60 }}>
        <div style={{ display: 'flex', gap: 'clamp(16px,3vw,48px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 'clamp(110px,14vw,190px)', aspectRatio: '1', flex: 'none' }}><EyeOfNature rays={420} eyeSize={0.1} reach={0.48} palette="copper" seed={3} /></div>
          <p className="big" style={{ flex: 1, minWidth: 280 }}>Javier Cruz Villarreal builds AI systems that <em>watch carefully</em>. CTO, hackathon winner, student in Madrid.</p>
        </div>
      </section>

      <section className="sect" id="index" style={{ paddingTop: 0 }}>
        <p className="kicker" style={{ marginBottom: 18 }}>Index of work</p>
        <div style={{ borderTop: '1px solid #2a2430' }}>
          {PLATES.map((_, i) => {
            const { project: p } = plateFor(i)
            return (
              <Link to={`/work/${p.slug}`} className="irow" key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <span>{ROMAN[i]}</span><h3>{p.title}</h3><span>{p.kind.en.split('·')[0]}</span><span>{p.when.en}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="sect" id="about" style={{ paddingTop: 0 }}>
        <div className="two">
          <div>
            <p className="kicker">Now</p>
            <p className="big" style={{ fontSize: 'clamp(26px,3vw,44px)', margin: '16px 0 28px' }}>Co-founder and CTO of Pharmable. CTO at Hospitia. Studying CS and AI at IE University.</p>
            {experience.slice(0, 4).map((x) => <p key={x.org} className="wall" style={{ marginBottom: 12 }}><b>{x.role.en}</b><br /><span className="dim">{x.org} · {x.when.en}</span></p>)}
          </div>
          <figure style={{ margin: 0 }}>
            <div className="frame-art">{ref ? <Painting id="portrait" sketch={makePortrait(ref)} opts={{ W: 720, H: 794, bg: '#efe6d4', seed: 42 }} /> : <div style={{ aspectRatio: '720/794' }} />}</div>
            <figcaption className="wall" style={{ marginTop: 12 }}><b>Self-portrait</b> · painted in code</figcaption>
          </figure>
        </div>
      </section>

      <section className="sect" style={{ background: '#08060b' }}>
        <p className="kicker">Contact</p>
        <p className="big" style={{ margin: '18px 0 32px' }}><a href={`mailto:${profile.email}`} style={{ borderBottom: '1px solid #e8b04a' }}>{profile.email}</a></p>
        <div className="stage" style={{ maxWidth: 720 }}><ContactForm /></div>
      </section>

      <div ref={plate} className="hoverplate" style={{ opacity: hover === null ? 0 : 1 }}>
        {PLATES.map((pl, i) => <div key={pl.id} style={{ display: hover === i ? 'block' : 'none' }}><Painting id={pl.id} sketch={pl.sketch} opts={{ W: 800, H: 1000, seed: i + 1 }} /></div>)}
      </div>
    </div>
  )
}
