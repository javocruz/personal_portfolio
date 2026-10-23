import { Link } from 'react-router-dom'
import { EyeOfNature } from '../art/EyeOfNature'
import { IsleScene } from '../art/IsleScene'
import { Painting } from '../art/Painting'
import { faceSheet } from '../art/faces'
import { loadRef, makePortrait, type Ref } from '../art/portrait'
import { ContactForm } from '../../components/ContactForm'
import { experience, skills, profile } from '../../content/profile'
import { BackToLab, LayoutNav, PlateImage, ROMAN, plateFor } from './bits'
import { useEffect, useState } from 'react'

export default function LayoutA() {
  const [ref, setRef] = useState<Ref | null>(null)
  useEffect(() => { loadRef().then(setRef) }, [])
  return (
    <div className="lab">
      <LayoutNav items={[['#plates', 'Plates'], ['#cabinet', 'Cabinet'], ['#portrait', 'Portrait'], ['/blog', 'Journal'], ['/cv', 'CV']]} />
      <BackToLab />

      <section className="frame" style={{ height: '100svh' }}>
        <div className="fill"><IsleScene mode="engraved-gold" /></div>
        <div className="fill"><EyeOfNature rays={800} arc={[180, 360]} cx={0.5} cy={0.3} eyeSize={0.05} reach={0.55} palette="gold" seed={11} /></div>
        <div className="grain" />
        <div className="title-over" style={{ bottom: '9%', top: 'auto' }}>
          <h1>Javier Cruz <em style={{ color: '#e8b04a' }}>Villarreal</em></h1>
          <p>CS & AI · CTO · builds systems that watch carefully</p>
        </div>
      </section>

      <section className="sect">
        <p className="kicker">The work</p>
        <p className="big" style={{ marginTop: 18 }}>I build AI products from idea to demo: agents that dispatch, engines that <em>verify</em>, and the interfaces people trust to <em>look</em>.</p>
      </section>

      <section className="sect" id="plates" style={{ paddingTop: 0 }}>
        <div className="hall">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const { project: p } = plateFor(i)
            return (
              <figure key={i} className={`p${i + 1}`}>
                <div className="frame-art"><PlateImage i={i} /></div>
                <figcaption className="wall" style={{ marginTop: 14 }}>
                  <b>Plate {ROMAN[i]}</b> · {p.title}<br />
                  <span className="dim">{p.kind.en} · {p.when.en}</span><br />
                  <span className="dim">{p.badge.en}</span><br />
                  <Link className="enter" to={`/work/${p.slug}`}>Enter the room →</Link>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </section>

      <hr className="rule" />
      <section className="sect" id="cabinet">
        <p className="kicker">The cabinet</p>
        <p className="big" style={{ margin: '18px 0 48px' }}>Experiments. Everything here is <em>drawn by code</em>.</p>
        <div className="two">
          <figure style={{ margin: 0 }}>
            <div className="frame-art"><Painting id="faces" sketch={faceSheet} opts={{ W: 720, H: 960, bg: '#e8dfc9', seed: 77 }} /></div>
            <figcaption className="wall" style={{ marginTop: 12 }}><b>Forty-eight faces</b> · none drawn by hand</figcaption>
          </figure>
          <div>
            <p className="wall dim">Ink, watercolour and charcoal brushes (p5.brush), seeded randomness, vector fields for the hand-drawn wobble. View the source of any plate in the lab.</p>
            <Link className="enter" style={{ marginTop: 18 }} to="/lab/plates">Browse the code →</Link>
          </div>
        </div>
      </section>

      <hr className="rule" />
      <section className="sect" id="portrait">
        <div className="two">
          <figure style={{ margin: 0 }}>
            <div className="frame-art">{ref ? <Painting id="portrait" sketch={makePortrait(ref)} opts={{ W: 720, H: 794, bg: '#efe6d4', seed: 42 }} /> : <div style={{ aspectRatio: '720/794' }} />}</div>
            <figcaption className="wall" style={{ marginTop: 12 }}><b>Self-portrait</b> · watercolour and pen, in code</figcaption>
          </figure>
          <div>
            <p className="kicker">About</p>
            <p className="big" style={{ fontSize: 'clamp(26px,3vw,44px)', margin: '16px 0 28px' }}>Computer Science and AI student in Madrid. CTO across two AI startups. Hackathon winner.</p>
            {skills.map((s) => <p key={s.group.en} className="wall" style={{ marginBottom: 10 }}><b>{s.group.en}</b><br /><span className="dim">{s.items.join(' · ')}</span></p>)}
          </div>
        </div>
        <div style={{ marginTop: 80, borderTop: '1px solid #2a2430' }}>
          {experience.slice(0, 5).map((x) => (
            <div className="xrow" key={x.org}>
              <span className="wall dim">{x.when.en}</span>
              <div><h3>{x.role.en}</h3><p className="wall dim" style={{ marginTop: 6 }}>{x.org}</p></div>
              <p>{x.bullets[0].en}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sect" id="contact" style={{ background: '#08060b' }}>
        <p className="kicker">Let’s talk</p>
        <p className="big" style={{ margin: '18px 0 32px' }}><a href={`mailto:${profile.email}`} style={{ borderBottom: '1px solid #e8b04a' }}>{profile.email}</a></p>
        <div className="stage" style={{ maxWidth: 720 }}><ContactForm /></div>
      </section>
    </div>
  )
}
