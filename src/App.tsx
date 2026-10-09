import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import Lenis from 'lenis'
import { I18nProvider } from './lib/i18n'
import { ThemeProvider } from './lib/theme'
import { FxProvider } from './lib/fx'
import { Nav } from './components/Nav'
import { CommandPalette } from './components/CommandPalette'
import Home from './pages/Home'
import Work from './pages/Work'
import CaseStudy from './pages/CaseStudy'
import Cv from './pages/Cv'
import NotFound from './pages/NotFound'
import { BlogIndex, BlogPost } from './pages/Blog'

function Shell() {
  const location = useLocation()
  const [palette, setPalette] = useState(false)
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // After a route change, jump to the hash target if there is one, otherwise to the top.
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 60)
    else scrollTo(0, 0)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09 })
    let raf = requestAnimationFrame(function tick(t) { lenis.raf(t); raf = requestAnimationFrame(tick) })
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) }
      else if (e.key === '/' && !typing) { e.preventDefault(); setPalette(true) }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [])

  useEffect(() => {
    const el = cursor.current
    if (!el || !matchMedia('(hover: hover)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY; el.dataset.on = '1'
      el.dataset.big = (e.target as HTMLElement).closest('a,button,.work,.xp-row,.cv-card') ? '1' : '0'
    }
    const loop = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; el.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop) }
    addEventListener('mousemove', move); raf = requestAnimationFrame(loop)
    return () => { removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={cursor} className="cursor" aria-hidden />
      <Nav openPalette={() => setPalette(true)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<CaseStudy />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/cv" element={<Cv />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <FxProvider>
            <Shell />
          </FxProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
