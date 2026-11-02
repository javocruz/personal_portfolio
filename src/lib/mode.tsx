import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * javicruz.dev is one site (the "site": pond, projects, gallery, blog) with two other whole sites hung in its gallery:
 * Core (quick, one page) and Complete (the full exhibition). `mode` is which exhibit you are inside; null is the site.
 * Entering an exhibit lasts for this tab only, so every new visit opens on the site. ?mode=core|complete links in.
 */
export type Mode = 'core' | 'complete'
const Ctx = createContext<{ mode: Mode | null; setMode: (m: Mode) => void; reset: () => void }>(null as never)

const read = (): Mode | null => {
  try {
    localStorage.removeItem('mode') // the old entrance remembered a mode forever; the site is the front door now
    const q = new URLSearchParams(location.search).get('mode')
    if (q === 'core' || q === 'complete') { sessionStorage.setItem('mode', q); return q }
    const s = sessionStorage.getItem('mode')
    if (s === 'core' || s === 'complete') return s
  } catch { /* storage unavailable: show the site */ }
  return null
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, set] = useState<Mode | null>(read)
  useEffect(() => { document.documentElement.dataset.mode = mode ?? 'site' }, [mode])
  const setMode = useCallback((m: Mode) => {
    set(m)
    try { sessionStorage.setItem('mode', m) } catch { /* ignore */ }
    // drop a ?mode= from the address bar, or a reload would undo the switch
    const u = new URL(location.href)
    if (u.searchParams.has('mode')) { u.searchParams.delete('mode'); history.replaceState(history.state, '', u) }
  }, [])
  const reset = useCallback(() => { set(null); try { sessionStorage.removeItem('mode') } catch { /* ignore */ } }, [])
  const value = useMemo(() => ({ mode, setMode, reset }), [mode, setMode, reset])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useMode = () => useContext(Ctx)
