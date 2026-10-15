import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dict, type UIKey } from '../content/ui'
import type { L, Lang } from '../content/types'

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: UIKey) => string; l: (x: L) => string }
const I18n = createContext<Ctx>(null as never)

const initial = (): Lang => {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'en' || saved === 'es') return saved
  } catch { /* storage unavailable */ }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial)
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch { /* ignore */ }
  }, [])
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (k) => dict[lang][k], l: (x) => x[lang] }), [lang, setLang])
  return <I18n.Provider value={value}>{children}</I18n.Provider>
}

export const useI18n = () => useContext(I18n)
