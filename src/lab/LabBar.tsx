import { Link, useLocation } from 'react-router-dom'

const links: [string, string][] = [
  ['/lab', 'Index'], ['/lab/heroes', 'Heroes'], ['/lab/plates', 'Plates'], ['/lab/cabinet', 'Cabinet'],
  ['/lab/a', 'Layout A'], ['/lab/b', 'Layout B'], ['/lab/c', 'Layout C'],
]

export function LabBar() {
  const { pathname } = useLocation()
  return (
    <div className="lab-bar">
      <b>Design lab</b>
      {links.map(([to, name]) => <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{name}</Link>)}
      <Link to="/" style={{ marginLeft: 'auto' }}>Exit lab</Link>
    </div>
  )
}
