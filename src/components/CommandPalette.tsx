import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useTheme } from '../lib/theme'
import { useFx } from '../lib/fx'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { posts } from '../posts'

type Item = { id: string; group: string; label: string; hint?: string; run: () => void }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, l, lang, setLang } = useI18n()
  const { toggle } = useTheme()
  const { toggleHyper, say } = useFx()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => { onClose(); nav(to) }
    const hash = (h: string) => () => { onClose(); location.href = h }
    return [
      { id: 'home', group: t('pal.g.go'), label: t('pal.home'), run: go('/') },
      { id: 'work', group: t('pal.g.go'), label: t('nav.work'), run: go('/work') },
      { id: 'xp', group: t('pal.g.go'), label: t('nav.experience'), run: hash('/#experience') },
      { id: 'blog', group: t('pal.g.go'), label: t('nav.writing'), run: go('/blog') },
      { id: 'cv', group: t('pal.g.go'), label: t('nav.cv'), run: go('/cv') },
      { id: 'contact', group: t('pal.g.go'), label: t('nav.contact'), run: hash('/#contact') },
      ...projects.map((p) => ({ id: p.slug, group: t('pal.g.projects'), label: p.title, hint: l(p.badge), run: go(`/work/${p.slug}`) })),
      ...posts.map((p) => ({ id: `post-${p.slug}`, group: t('pal.g.writing'), label: p.title, hint: p.tags.join(', '), run: go(`/blog/${p.slug}`) })),
      { id: 'theme', group: t('pal.g.actions'), label: t('pal.theme'), run: () => { toggle(); onClose() } },
      { id: 'lang', group: t('pal.g.actions'), label: t('pal.lang'), run: () => { setLang(lang === 'en' ? 'es' : 'en'); onClose() } },
      { id: 'copy', group: t('pal.g.actions'), label: t('pal.copy'), hint: profile.email, run: () => { navigator.clipboard?.writeText(profile.email); say(t('pal.copied')); onClose() } },
      { id: 'cvdl', group: t('pal.g.actions'), label: t('pal.cv'), run: () => { onClose(); window.open('/cv/Javier_Cruz_CV_AIxX.pdf', '_blank') } },
      { id: 'gh', group: t('pal.g.actions'), label: t('pal.github'), run: () => { onClose(); window.open(profile.github, '_blank') } },
      { id: 'li', group: t('pal.g.actions'), label: t('pal.linkedin'), run: () => { onClose(); window.open(profile.linkedin, '_blank') } },
      { id: 'hyper', group: t('pal.g.actions'), label: 'Engage hyperdrive ✦', run: () => { onClose(); toggleHyper() } },
    ]
  }, [t, l, lang, setLang, toggle, toggleHyper, say, nav, onClose])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((i) => `${i.label} ${i.hint ?? ''} ${i.group}`.toLowerCase().includes(s))
  }, [items, q])

  useEffect(() => { setSel(0) }, [q, open])
  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => input.current?.focus(), 30) }
  }, [open])

  if (!open) return null
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, shown.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); shown[sel]?.run() }
    else if (e.key === 'Escape') onClose()
  }
  let lastGroup = ''
  return (
    <div className="pal-backdrop" onMouseDown={onClose}>
      <div className="pal" role="dialog" aria-modal="true" aria-label={t('search')} onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('pal.placeholder')} aria-label={t('search')} />
        <ul role="listbox">
          {shown.length === 0 && <li className="pal-empty">{t('pal.empty')}</li>}
          {shown.map((it, i) => {
            const head = it.group !== lastGroup ? <li key={`g-${it.group}-${i}`} className="pal-group">{it.group}</li> : null
            lastGroup = it.group
            return [head, (
              <li key={it.id} role="option" aria-selected={i === sel} className={i === sel ? 'on' : ''} onMouseEnter={() => setSel(i)} onClick={it.run}>
                <span>{it.label}</span>{it.hint && <small>{it.hint}</small>}
              </li>
            )]
          })}
        </ul>
      </div>
    </div>
  )
}
