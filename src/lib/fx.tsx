import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useI18n } from './i18n'

const Ctx = createContext<{ hyper: boolean; toggleHyper: () => void; toast: string | null; say: (m: string) => void }>(null as never)
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function FxProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [hyper, setHyper] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const say = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(null), 2200) }, [])
  const toggleHyper = useCallback(() => setHyper((h) => { say(h ? t('egg.off') : t('egg.on')); return !h }), [say, t])

  useEffect(() => {
    let i = 0
    const on = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0
      if (i === KONAMI.length) { i = 0; toggleHyper() }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [toggleHyper])

  const value = useMemo(() => ({ hyper, toggleHyper, toast, say }), [hyper, toggleHyper, toast, say])
  return <Ctx.Provider value={value}>{children}{toast && <div className="toast" role="status">{toast}</div>}</Ctx.Provider>
}

export const useFx = () => useContext(Ctx)
