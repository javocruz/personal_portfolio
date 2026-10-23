import { useRef, useState, type FormEvent } from 'react'
import { useI18n } from '../lib/i18n'

type State = 'idle' | 'sending' | 'sent' | 'error' | 'invalid' | 'local'

export function ContactForm() {
  const { t } = useI18n()
  const [state, setState] = useState<State>('idle')
  const started = useRef(Date.now())

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = {
      name: String(f.get('name') ?? '').trim(),
      email: String(f.get('email') ?? '').trim(),
      message: String(f.get('message') ?? '').trim(),
      company: String(f.get('company') ?? ''), // honeypot: humans never see this field
      t: started.current,
    }
    if (!body.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email) || body.message.length < 10) return setState('invalid')
    setState('sending')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (r.status === 404 && import.meta.env.DEV) return setState('local')
      setState(r.ok ? 'sent' : r.status === 400 ? 'invalid' : 'error')
      if (r.ok) (e.target as HTMLFormElement).reset()
    } catch {
      setState(import.meta.env.DEV ? 'local' : 'error')
    }
  }

  if (state === 'sent') return <p className="form-note ok" role="status">{t('form.sent')}</p>
  return (
    <form className="form" onSubmit={submit} noValidate>
      <label><span>{t('form.name')}</span><input name="name" autoComplete="name" maxLength={100} required /></label>
      <label><span>{t('form.email')}</span><input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
      <label className="wide"><span>{t('form.message')}</span><textarea name="message" rows={5} maxLength={5000} required /></label>
      <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      <div className="form-foot">
        <button className="btn solid" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t('form.sending') : t('form.send')}</button>
        {state === 'invalid' && <p className="form-note err" role="alert">{t('form.invalid')}</p>}
        {state === 'error' && <p className="form-note err" role="alert">{t('form.error')}</p>}
        {state === 'local' && <p className="form-note err" role="alert">{t('form.local')}</p>}
      </div>
    </form>
  )
}
