import { Link } from 'react-router-dom'
import { Painting } from '../art/Painting'
import { PLATES } from '../art/plates'
import { projects } from '../../content/projects'
import '../lab.css'
import './layouts.css'

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']
export const plateFor = (i: number) => ({ plate: PLATES[i], project: projects.find((p) => p.slug === PLATES[i].slug)! })

export function PlateImage({ i, className }: { i: number; className?: string }) {
  const { plate } = plateFor(i)
  return <Painting id={plate.id} sketch={plate.sketch} opts={{ W: 800, H: 1000, seed: plate.seed }} className={className} alt="" />
}

export function BackToLab() {
  return <Link to="/lab" className="back-lab">← Design lab</Link>
}

export function LayoutNav({ items }: { items: [string, string][] }) {
  return (
    <header className="lnav">
      <Link to="/lab" className="logo">JCV</Link>
      <nav>{items.map(([to, label]) => (to.startsWith('#') ? <a key={to} href={to}>{label}</a> : <Link key={to} to={to}>{label}</Link>))}</nav>
    </header>
  )
}
