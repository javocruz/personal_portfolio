import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { I18nProvider } from './lib/i18n'
import { FxProvider } from './lib/fx'
import { ModeProvider, useMode } from './lib/mode'
import { CoreStyleProvider } from './lib/coreStyle'
import { Nav } from './components/Nav'
import { CommandPalette } from './components/CommandPalette'
import CoreHome from './pages/CoreHome'
import SiteHome from './site/SiteHome'
import { SiteNav } from './site/SiteNav'
import { useArrive } from './site/steps'
import './site/site.css'
import NotFound from './pages/NotFound'

// Everything heavier than Core loads on demand.
const CompleteHome = lazy(() => import('./pages/CompleteHome'))
const Gallery = lazy(() => import('./pages/Gallery'))
const CaseStudy = lazy(() => import('./pages/CaseStudy'))
const BlogIndex = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogIndex })))
const BlogPost = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogPost })))
const CoreWork = lazy(() => import('./pages/CoreWork'))
// the site's pages (the home is eager: it's the front door)
const SiteProjects = lazy(() => import('./site/SiteProjects'))
const SiteProject = lazy(() => import('./site/SiteProject'))
const SiteGallery = lazy(() => import('./site/SiteGallery'))
const SiteBlog = lazy(() => import('./site/SiteBlog'))
// Design lab (prototypes)
const LabIndex = lazy(() => import('./lab/LabIndex'))
const Heroes = lazy(() => import('./lab/Heroes'))
const Plates = lazy(() => import('./lab/Plates'))
const Cabinet = lazy(() => import('./lab/Cabinet'))
const Bake = lazy(() => import('./lab/Bake'))
const Ponds = lazy(() => import('./lab/Ponds'))
const LayoutA = lazy(() => import('./lab/layouts/A'))
const LayoutB = lazy(() => import('./lab/layouts/B'))
const LayoutC = lazy(() => import('./lab/layouts/C'))

// No mode: the site. Inside an exhibit (Core or Complete), its own pages.
function Home() {
  const { mode } = useMode()
  if (!mode) return <SiteHome />
  return mode === 'core' ? <CoreHome /> : <CompleteHome />
}
function Work() {
  const { mode } = useMode()
  if (!mode) return <Navigate to="/projects" replace />
  return mode === 'complete' ? <Gallery /> : <CoreWork />
}
function WorkCase() {
  const { mode } = useMode()
  const { slug } = useParams()
  return mode ? <CaseStudy /> : <Navigate to={`/projects/${slug}`} replace />
}
function Blog() {
  const { mode } = useMode()
  return mode ? <BlogIndex /> : <SiteBlog />
}

function Shell() {
  const location = useLocation()
  const { mode } = useMode()
  const [palette, setPalette] = useState(false)
  const inLab = location.pathname.startsWith('/lab')
  useArrive()

  useEffect(() => {
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 80)
    else scrollTo(0, 0)
  }, [location.pathname, location.hash, mode])

  // Once the page is idle, fetch the pages a visitor is likely to open next so clicking through feels instant.
  useEffect(() => {
    if (inLab) return
    const go = !mode
      ? () => { import('./site/SiteProjects'); import('./site/SiteProject'); import('./site/SiteGallery') }
      : mode === 'complete'
        ? () => { import('./pages/Gallery'); import('./pages/CaseStudy'); import('./pages/CompleteHome') }
        : () => { import('./pages/CaseStudy'); import('./pages/Blog') }
    const id = 'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 3000 }) : setTimeout(go, 2000)
    return () => { 'cancelIdleCallback' in window ? cancelIdleCallback(id as number) : clearTimeout(id as number) }
  }, [mode, inLab])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) }
      else if (e.key === '/' && !typing) { e.preventDefault(); setPalette(true) }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [])

  const lz = (el: React.ReactNode) => <Suspense fallback={<div className="page-loading" />}>{el}</Suspense>

  return (
    <>
      {!inLab && (mode ? <Nav openPalette={() => setPalette(true)} /> : <SiteNav />)}
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      {/* new pages fade in; nothing waits for the old page to fade out */}
      <div className="page" key={location.pathname + (mode ?? '')}>
          <Routes location={location}>
            <Route path="/" element={lz(<Home />)} />
            <Route path="/work" element={lz(<Work />)} />
            <Route path="/work/:slug" element={lz(<WorkCase />)} />
            <Route path="/projects" element={lz(<SiteProjects />)} />
            <Route path="/projects/:slug" element={lz(<SiteProject />)} />
            <Route path="/gallery" element={lz(<SiteGallery />)} />
            <Route path="/blog" element={lz(<Blog />)} />
            <Route path="/blog/:slug" element={lz(<BlogPost />)} />
            {/* the CV is a download in the contact section now; old links land there */}
            <Route path="/cv" element={<Navigate to="/#contact" replace />} />
            <Route path="/lab" element={lz(<LabIndex />)} />
            <Route path="/lab/heroes" element={lz(<Heroes />)} />
            <Route path="/lab/plates" element={lz(<Plates />)} />
            <Route path="/lab/cabinet" element={lz(<Cabinet />)} />
            <Route path="/lab/bake" element={lz(<Bake />)} />
            <Route path="/lab/ponds" element={lz(<Ponds />)} />
            <Route path="/lab/a" element={lz(<LayoutA />)} />
            <Route path="/lab/b" element={lz(<LayoutB />)} />
            <Route path="/lab/c" element={lz(<LayoutC />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ModeProvider>
          <CoreStyleProvider>
            <FxProvider>
              <Shell />
            </FxProvider>
          </CoreStyleProvider>
        </ModeProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
