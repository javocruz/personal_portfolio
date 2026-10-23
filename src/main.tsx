import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
// Complete's type (only @font-face rules here; the files download only when a Complete page uses them)
import '@fontsource/cormorant-garamond/latin-300.css'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-300-italic.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'

// After a redeploy, a tab that loaded the old page can ask for code files that no longer exist, which used to leave
// a black screen. Reload once to pick up the new build (the timestamp stops a reload loop if the server is down).
addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('reloadedAt') ?? 0)
    if (Date.now() - last > 10_000) { sessionStorage.setItem('reloadedAt', String(Date.now())); e.preventDefault(); location.reload() }
  } catch { /* storage blocked: let the error surface */ }
})

// Start fetching the Complete home right away instead of after React has rendered once.
try {
  const m = new URLSearchParams(location.search).get('mode') ?? localStorage.getItem('mode')
  if (m === 'complete' && location.pathname === '/') void import('./pages/CompleteHome')
} catch { /* storage blocked */ }
createRoot(document.getElementById('root')!).render(<App />)
