import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { now } from '../content/profile'

type Ev = { id: string; type: string; repo: { name: string }; created_at: string; payload: { commits?: unknown[]; size?: number } }
const CACHE = 'gh-events-v1'

export function Now() {
  const { t, l } = useI18n()
  const [events, setEvents] = useState<Ev[] | null | 'err'>(null)

  useEffect(() => {
    let dead = false
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE) || 'null')
      if (c && Date.now() - c.at < 10 * 60_000) { setEvents(c.events); return }
    } catch { /* ignore */ }
    fetch('https://api.github.com/users/javocruz/events/public?per_page=30')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((all: Ev[]) => {
        const ev = all.filter((e) => e.type === 'PushEvent').slice(0, 4)
        try { sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), events: ev })) } catch { /* ignore */ }
        if (!dead) setEvents(ev)
      })
      .catch(() => !dead && setEvents('err'))
    return () => { dead = true }
  }, [])

  const ago = (iso: string) => {
    const d = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000))
    return d < 24 ? `${d}h` : `${Math.round(d / 24)}d`
  }

  return (
    <div className="now">
      <div>
        <p className="mono dim">{t('now.title')}</p>
        <ul className="now-list">{now.map((n, i) => <li key={i}>{l(n)}</li>)}</ul>
      </div>
      <div>
        <p className="mono dim">{t('now.github')}</p>
        {events === null && <p className="dim">{t('now.loading')}</p>}
        {events === 'err' && <p className="dim">{t('now.unavailable')}</p>}
        {Array.isArray(events) && events.length === 0 && <p className="dim">{t('now.unavailable')}</p>}
        {Array.isArray(events) && events.length > 0 && (
          <ul className="gh-list">
            {events.map((e) => (
              <li key={e.id}>
                <a href={`https://github.com/${e.repo.name}`} target="_blank" rel="noreferrer">{e.repo.name.replace('javocruz/', '')}</a>
                <span className="dim">{e.payload.size ?? e.payload.commits?.length ?? 1} {t('now.commits')} · {ago(e.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
