import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { I18nProvider } from './lib/i18n'
import { ThemeProvider } from './lib/theme'
import { FxProvider } from './lib/fx'
import { ModeProvider, useMode } from './lib/mode'
import { Nav } from './components/Nav'
import { CommandPalette } from './components/CommandPalette'
import Gate from './pages/Gate'
import CoreHome from './pages/CoreHome'
import NotFound from './pages/NotFound'

// Everything heavier than Core loads on demand.
const CompleteHome = lazy(() => import('./pages/CompleteHome'))
const Gallery = lazy(() => import('./pages/Gallery'))
const CaseStudy = lazy(() => import('./pages/CaseStudy'))
const Cv = lazy(() => import('./pages/Cv'))
const BlogIndex = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogIndex })))
const BlogPost = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogPost })))
const CoreWork = lazy(() => import('./pages/CoreWork'))
// Design lab (prototypes)
const LabIndex = lazy(() => import('./lab/LabIndex'))
const Heroes = lazy(() => import('./lab/Heroes'))
const Plates = lazy(() => import('./lab/Plates'))
const Cabinet = lazy(() => import('./lab/Cabinet'))
const Bake = lazy(() => import('./lab/Bake'))
const LayoutA = lazy(() => import('./lab/layouts/A'))
const LayoutB = lazy(() => import('./lab/layouts/B'))
const LayoutC = lazy(() => import('./lab/layouts/C'))

function Home() {
  const { mode } = useMode()
  if (!mode) return <Gate />
  return mode === 'core' ? <CoreHome /> : <CompleteHome />
}
function Work() {
  const { mode } = useMode()
  return mode === 'complete' ? <Gallery /> : <CoreWork />
}

function Shell() {
  const location = useLocation()
  const { mode } = useMode()
  const [palette, setPalette] = useState(false)
  const inLab = location.pathname.startsWith('/lab')
  const gate = !mode && location.pathname === '/'

  useEffect(() => {
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 80)
    else scrollTo(0, 0)
  }, [location.pathname, location.hash, mode])

  // Once the page is idle, fetch the other Complete pages so clicking through feels instant.
  useEffect(() => {
    if (mode !== 'complete' || inLab) return
    const go = () => { import('./pages/Gallery'); import('./pages/CaseStudy'); import('./pages/CompleteHome') }
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
      {!inLab && !gate && !(mode === 'core' && location.pathname === '/') && <Nav openPalette={() => setPalette(true)} />}
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      {/* new pages fade in; nothing waits for the old page to fade out */}
      <div className="page" key={location.pathname + (mode ?? '')}>
          <Routes location={location}>
            <Route path="/" element={lz(<Home />)} />
            <Route path="/work" element={lz(<Work />)} />
            <Route path="/work/:slug" element={lz(<CaseStudy />)} />
            <Route path="/blog" element={lz(<BlogIndex />)} />
            <Route path="/blog/:slug" element={lz(<BlogPost />)} />
            <Route path="/cv" element={lz(<Cv />)} />
            <Route path="/lab" element={lz(<LabIndex />)} />
            <Route path="/lab/heroes" element={lz(<Heroes />)} />
            <Route path="/lab/plates" element={lz(<Plates />)} />
            <Route path="/lab/cabinet" element={lz(<Cabinet />)} />
            <Route path="/lab/bake" element={lz(<Bake />)} />
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
        <ThemeProvider>
          <ModeProvider>
            <FxProvider>
              <Shell />
            </FxProvider>
          </ModeProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
