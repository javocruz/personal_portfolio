import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * Two ways to see the site. Core: quick, text-first, almost no JavaScript. Complete: the full exhibition.
 * The choice is made once on the entrance screen and remembered; ?mode=core|complete overrides it (handy for links).
 */
export type Mode = 'core' | 'complete'
const Ctx = createContext<{ mode: Mode | null; setMode: (m: Mode) => void; reset: () => void }>(null as never)

const read = (): Mode | null => {
  try {
    const q = new URLSearchParams(location.search).get('mode')
    if (q === 'core' || q === 'complete') { localStorage.setItem('mode', q); return q }
    const s = localStorage.getItem('mode')
    if (s === 'core' || s === 'complete') return s
  } catch { /* storage unavailable: show the entrance */ }
  return null
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, set] = useState<Mode | null>(read)
  useEffect(() => { document.documentElement.dataset.mode = mode ?? 'gate' }, [mode])
  const setMode = useCallback((m: Mode) => { set(m); try { localStorage.setItem('mode', m) } catch { /* ignore */ } }, [])
  const reset = useCallback(() => { set(null); try { localStorage.removeItem('mode') } catch { /* ignore */ } }, [])
  const value = useMemo(() => ({ mode, setMode, reset }), [mode, setMode, reset])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useMode = () => useContext(Ctx)
