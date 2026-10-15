import { Link } from 'react-router-dom'
import { EyeOfNature } from './art/EyeOfNature'
import { IsleScene, type IsleMode } from './art/IsleScene'
import { LabBar } from './LabBar'
import './lab.css'

function Frame({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section className="frame" id={id}>
      {children}
      <div className="grain" />
      <span className="tag">{id.toUpperCase()} · {label}</span>
    </section>
  )
}

const Title = ({ top = '38%' }: { top?: string }) => (
  <div className="title-over" style={{ top }}>
    <h1>Javier Cruz <em style={{ color: '#e8b04a' }}>Villarreal</em></h1>
    <p>Builds systems that watch carefully</p>
  </div>
)

export default function Heroes() {
  const isle = (mode: IsleMode) => <div className="fill"><IsleScene mode={mode} /></div>
  return (
    <div className="lab">
      <LabBar />
      <div style={{ height: 44 }} />
      <Frame id="h1" label="Eye of nature, rays on black, follows your cursor">
        <div className="fill"><EyeOfNature rays={1000} palette="copper" eyeSize={0.085} /></div>
        <Title top="auto" />
      </Frame>
      <Frame id="h2" label="Isle engraved in gold line-work on black">
        {isle('engraved-gold')}
        <Title top="12%" />
      </Frame>
      <Frame id="h3" label="Isle at dusk: blue shadows, gold lights, moving water">
        {isle('dusk')}
        <Title top="10%" />
      </Frame>
      <Frame id="h4" label="Isle, 1-bit blue dither (Shubhu-style)">
        {isle('dither-blue')}
        <Title top="10%" />
      </Frame>
      <Frame id="h5" label="Merge: the eye rises between the cypresses (spiral engraving)">
        {isle('engraved-gold')}
        <div className="fill">
          <EyeOfNature rays={800} arc={[180, 360]} cx={0.5} cy={0.3} eyeSize={0.05} reach={0.55} palette="gold" seed={11} />
        </div>
        <Title top="68%" />
      </Frame>
      <p style={{ padding: 40, font: '400 12px var(--mono)', opacity: .6 }}><Link to="/lab">← Lab index</Link></p>
    </div>
  )
}
