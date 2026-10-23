import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMode } from './mode'

/**
 * Core's two painters. Same page, same order; the style redraws the paintings and nudges a few UI details.
 * Remembered once chosen; ?style=mondrian|rothko overrides it (handy for links). First visits get Rothko.
 */
export type CoreStyle = 'mondrian' | 'rothko'
export const CORE_STYLES: CoreStyle[] = ['mondrian', 'rothko']
/** The ground colour of each style, for <meta name="theme-color">. */
export const coreGround: Record<CoreStyle, string> = { mondrian: '#f7f5ef', rothko: '#f8f3ea' }
const Ctx = createContext<{ style: CoreStyle; setStyle: (s: CoreStyle) => void }>(null as never)

const read = (): CoreStyle => {
  try {
    const q = new URLSearchParams(location.search).get('style')
    if (q === 'mondrian' || q === 'rothko') { localStorage.setItem('coreStyle', q); return q }
    const s = localStorage.getItem('coreStyle')
    if (s === 'mondrian' || s === 'rothko') return s
  } catch { /* storage unavailable: use the default */ }
  return 'rothko'
}

export function CoreStyleProvider({ children }: { children: ReactNode }) {
  const [style, set] = useState<CoreStyle>(read)
  const { mode } = useMode()
  useEffect(() => { document.documentElement.dataset.coreStyle = style }, [style])
  // the browser chrome follows the page: Complete's near-black, or the active Core style's ground
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'core' ? coreGround[style] : '#0a0908')
  }, [mode, style])
  const setStyle = useCallback((s: CoreStyle) => { set(s); try { localStorage.setItem('coreStyle', s) } catch { /* ignore */ } }, [])
  const value = useMemo(() => ({ style, setStyle }), [style, setStyle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCoreStyle = () => useContext(Ctx)
