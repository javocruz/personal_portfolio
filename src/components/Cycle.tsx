import { useEffect, useRef, useState, type CSSProperties } from 'react'
import FRAG from './cycle.frag?raw'
import { stages, bakedAspect, bakedFocus, wallLabel, type Stage } from '../content/cycle'
import { useI18n } from '../lib/i18n'

const VERT = '#version 300 es\nlayout(location=0) in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const ENTER = { rise: 0, 'sweep-right': 1, centre: 2, 'from-fire': 3, fall: 4, 'close-in': 5 } as const
const LAST = stages.length - 1

/** Live-tunable values; the ?debug=cycle panel writes here. */
export const tune = { dot: 2.5, glow: 1, lens: 170, lensPh: 0.5, hold: -1 }

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const mixHex = (a: string, b: string, t: number) => {
  const A = rgb(a), B = rgb(b)
  return '#' + A.map((v, i) => Math.round((v + (B[i] - v) * t) * 255).toString(16).padStart(2, '0')).join('')
}
const triplet = (h: string) => rgb(h).map((v) => Math.round(v * 255)).join(' ')
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/**
 * One painting, decoded off the main thread: AVIF, then WebP, then JPEG (the same URLs a <picture> would pick, so they
 * share the HTTP cache). createImageBitmap also works while the tab isn't painting, where <img>.decode() can stall.
 */
function loadPainting(s: Stage, w: 960 | 1920) {
  const exts = s.jpgOnly ? ['jpg'] : ['avif', 'webp', 'jpg']
  const attempt = (k: number): Promise<ImageBitmap> =>
    fetch(`${s.img}-${w}.${exts[k]}`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.statusText))))
      .then((b) => createImageBitmap(b))
      .catch((e) => (k + 1 < exts.length ? attempt(k + 1) : Promise.reject(e)))
  return attempt(0)
}

/** Which painting is on screen for a scroll position: 0 = isle … LAST = black before contact; fractions are mid-dissolve. */
function scrollTarget(tops: number[]) {
  const vh = innerHeight, mid = scrollY + vh * 0.5, zone = vh * 0.7
  let P = 0
  for (let k = 1; k < tops.length; k++) if (tops[k] !== undefined) P += Math.min(1, Math.max(0, (mid - (tops[k] - zone / 2)) / zone))
  return Math.min(P, LAST)
}

type Engine = 'pending' | 'gl' | 'css'

/**
 * The scroll cycle behind Complete's home: one fixed WebGL2 canvas, two paintings bound at a time, a dither dissolve
 * between them driven by scroll. Without WebGL2, with reduced motion, or on a device that can't keep up, the paintings
 * swap as fixed backgrounds with a CSS crossfade instead.
 */
export function Cycle() {
  const { lang } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const [engine, setEngine] = useState<Engine>('pending')
  const [stage, setStage] = useState(0)
  const [seen, setSeen] = useState(0)
  const [fade, setFade] = useState(600)
  const live = useRef({ p: 0, t: 0, fps: 0 })
  const debug = import.meta.env.DEV && new URLSearchParams(location.search).get('debug') === 'cycle'

  useEffect(() => {
    const root = document.documentElement
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 760
    let mode: Engine = 'pending', dead = false

    // ---- section geometry: the top of each [data-cycle] section, by stage index
    let tops: number[] = [0]
    const measure = () => {
      tops = [0]
      document.querySelectorAll<HTMLElement>('[data-cycle]').forEach((el) => { tops[+el.dataset.cycle!] = el.getBoundingClientRect().top + scrollY })
    }

    // ---- page colours follow the painting: written straight onto :root, no React render per frame
    const vars: Record<string, string> = {}
    const setVar = (k: string, v: string) => { if (vars[k] !== v) { vars[k] = v; root.style.setProperty(k, v) } }
    const paletteAt = (p: number) => {
      const a = Math.min(Math.floor(p), LAST - 1), t = p - a, A = stages[a].palette, B = stages[a + 1].palette
      setVar('--accent', mixHex(A.accent, B.accent, t))
      setVar('--cyc-glow', mixHex(A.glow, B.glow, t))
      setVar('--cyc-smoke', triplet(mixHex(A.smoke, B.smoke, t)))
    }
    let shown = -1
    const show = (i: number) => { if (i !== shown) { shown = i; setStage(i); setSeen((s) => Math.max(s, i)) } }

    // ---- CSS engine (also what you see before WebGL starts): swap at the boundary, crossfade in CSS
    const cssScroll = () => { const i = Math.round(scrollTarget(tops)); show(i); paletteAt(i) }

    let stopGL: (() => void) | null = null
    const toCss = (ms: number) => {
      if (dead) return
      stopGL?.(); stopGL = null
      mode = 'css'; setEngine('css'); setFade(ms); setVar('--cyc-ui', '1'); cssScroll()
    }

    // ---- WebGL engine
    const startGL = () => {
      if (dead || mode !== 'pending') return
      const canvas = canvasRef.current!
      const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' })
      if (!gl) return toCss(600)
      const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
      const prog = gl.createProgram()!
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('cycle shader:', gl.getProgramInfoLog(prog)); return toCss(600) }
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
      const U = new Proxy({} as Record<string, WebGLUniformLocation | null>, { get: (c, k: string) => (k in c ? c[k] : (c[k] = gl.getUniformLocation(prog, k))) })
      gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1)

      // canvas size: DPR capped (1.5, or 1.25 on phones); lvh so the phone URL bar doesn't resize it
      let dpr = 1
      const size = () => {
        dpr = Math.min(devicePixelRatio || 1, coarse ? 1.25 : 1.5)
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr)); canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      size()
      const texW: 960 | 1920 = innerWidth * dpr > 1100 ? 1920 : 960

      // ---- textures: two bound (A, B); the one after B is fetched once the dissolve passes 50%
      const texs = new Map<number, WebGLTexture>(), loading = new Set<number>(), failed = new Set<number>()
      const ready = (i: number) => !stages[i].img || texs.has(i) || failed.has(i)
      const want = (i: number) => {
        if (i < 0 || i > LAST || ready(i) || loading.has(i)) return
        loading.add(i)
        loadPainting(stages[i], texW).then((img) => {
          if (dead || gl.isContextLost()) return
          const t = gl.createTexture()!
          gl.bindTexture(gl.TEXTURE_2D, t)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
          img.close()
          texs.set(i, t)
        }, () => failed.add(i)).finally(() => { loading.delete(i); wake() })
      }
      // keep GPU memory to the neighbourhood of where you are
      const trim = (a: number) => texs.forEach((t, i) => { if (i < a - 1 || i > a + 2) { gl.deleteTexture(t); texs.delete(i) } })

      // ---- input
      let mx = -1e5, my = -1e5, pointer = false, mouse = false, touchUntil = 0, lastScroll = -1e9
      const onMove = (e: PointerEvent) => {
        mx = e.clientX * dpr; my = e.clientY * dpr
        pointer = true
        mouse = e.pointerType === 'mouse'
        if (!mouse) touchUntil = performance.now() + 600
        wake()
      }
      const onOut = (e: PointerEvent) => { if (!e.relatedTarget && e.pointerType === 'mouse') { pointer = false; wake() } }

      // ---- the loop: runs only while something is changing
      let raf = 0, last = 0, slow = 0, frameNo = 0, shift = 0, act = 0, lensW = 0, first = true
      let fpsT = 0, fpsN = 0
      const SHIFTS = [[0, 0], [1, 0], [1, 1], [0, 1]]
      const L = live.current
      L.p = scrollTarget(tops)
      const frame = (now: number) => {
        raf = 0
        const gap = last ? now - last : 0
        // a phone that can't hold ~50fps for 30 frames running hands over to the CSS crossfade
        if (coarse && gap > 20 && gap < 250) { if (++slow >= 30) return toCss(600) } else slow = 0
        const dt = Math.min(gap || 16.7, 100) / 16.667
        last = now

        // debug: hold pins the cycle at an exact position (stills, tuning)
        const P = tune.hold >= 0 ? tune.hold : scrollTarget(tops)
        let p = tune.hold >= 0 ? tune.hold : L.p
        if (Math.abs(P - p) > 1.5) p = P - Math.sign(P - p) * 0.5 // a jump (anchor link): don't play every painting on the way
        p += (P - p) * (1 - Math.pow(1 - 0.12, dt))
        if (Math.abs(P - p) < 1e-4) p = P
        let a = Math.min(Math.floor(p), LAST - 1)
        want(a); want(a + 1)
        if (!ready(a)) { L.p = a; return } // wait for the painting; its load wakes the loop
        if (!ready(a + 1)) p = a // hold until the next one is here, then carry on smoothly
        a = Math.min(Math.floor(p), LAST - 1)
        const t = p - a
        if (t > 0.5) want(a + 2)
        trim(a)

        // text and scrims step back while a dissolve is actually playing
        const scrolling = now - lastScroll < 400 || tune.hold >= 0
        act += ((scrolling || p !== P ? 1 : 0) - act) * (1 - Math.pow(0.86, dt))
        if (act < 0.002) act = 0
        const bump = smooth(0.06, 0.28, t) * (1 - smooth(0.72, 0.94, t))
        setVar('--cyc-ui', (1 - 0.75 * bump * act).toFixed(3))

        // cursor lens: on while a mouse is over the page, or for 600ms after a touch
        const touch = now < touchUntil
        const lensGoal = pointer && (mouse || touch) ? 1 : 0
        lensW += (lensGoal - lensW) * (1 - Math.pow(0.8, dt))
        if (Math.abs(lensGoal - lensW) < 0.003) lensW = lensGoal

        // shimmer: the Bayer pattern steps one dot every 4 frames while a dissolve plays
        const running = t > 0 && t < 1 && act > 0.05
        if (running && frameNo % 4 === 0) shift = (shift + 1) % 4
        frameNo++

        const A = stages[a], B = stages[a + 1], fa = bakedFocus(A), fb = bakedFocus(B)
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texs.get(a) ?? texs.get(a + 1) ?? null)
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texs.get(a + 1) ?? texs.get(a) ?? null)
        gl.uniform2f(U.uRes, canvas.width, canvas.height)
        gl.uniform1f(U.uT, t)
        gl.uniform1f(U.uDot, Math.max(1, (coarse ? Math.max(3, tune.dot) : tune.dot) * dpr))
        gl.uniform1f(U.uAspA, bakedAspect(A)); gl.uniform1f(U.uAspB, bakedAspect(B))
        gl.uniform2f(U.uFocA, fa.x, fa.y); gl.uniform2f(U.uFocB, fb.x, fb.y)
        gl.uniform1f(U.uHasA, texs.has(a) ? 1 : 0); gl.uniform1f(U.uHasB, texs.has(a + 1) ? 1 : 0)
        gl.uniform1i(U.uEnter, ENTER[B.enter])
        gl.uniform3fv(U.uHiA, rgb(A.palette.dotHi)); gl.uniform3fv(U.uLoA, rgb(A.palette.dotLo))
        gl.uniform3fv(U.uHiB, rgb(B.palette.dotHi)); gl.uniform3fv(U.uLoB, rgb(B.palette.dotLo))
        gl.uniform3fv(U.uGlow, rgb(B.palette.glow))
        gl.uniform2f(U.uMouse, mx, my); gl.uniform1f(U.uLens, lensW)
        gl.uniform1f(U.uLensR, tune.lens * dpr * (coarse ? 0.75 : 1)); gl.uniform1f(U.uLensPh, tune.lensPh)
        gl.uniform2f(U.uShift, SHIFTS[shift][0], SHIFTS[shift][1])
        gl.uniform1f(U.uGlowAmt, tune.glow)
        gl.uniform1f(U.uSeed, running ? frameNo % 64 : 0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)

        paletteAt(p)
        show(Math.round(p))
        L.p = p; L.t = t
        fpsN++; if (now - fpsT > 500) { L.fps = Math.round((fpsN * 1000) / (now - fpsT)); fpsT = now; fpsN = 0 }
        if (first) { first = false; canvas.dataset.ready = '1'; mode = 'gl'; setEngine('gl') }

        const more = p !== P || lensW !== lensGoal || act > 0 || scrolling || touch
        if (more && !document.hidden) raf = requestAnimationFrame(frame)
        else last = 0 // an idle gap isn't a slow frame
      }
      const wake = () => { if (!raf && !dead && !document.hidden) raf = requestAnimationFrame(frame) }
      const onScroll = () => { lastScroll = performance.now(); wake() }
      const onResize = () => { size(); measure(); wake() }
      const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = 0 } else wake() }
      const onLost = (e: Event) => { e.preventDefault(); toCss(600) }

      addEventListener('scroll', onScroll, { passive: true })
      addEventListener('resize', onResize)
      addEventListener('pointermove', onMove, { passive: true })
      addEventListener('pointerdown', onMove, { passive: true })
      document.addEventListener('pointerout', onOut)
      document.addEventListener('visibilitychange', onVis)
      addEventListener('cycle:tune', wake)
      const drawNow = () => { cancelAnimationFrame(raf); frame(performance.now()) }
      addEventListener('cycle:draw', drawNow)
      canvas.addEventListener('webglcontextlost', onLost)
      wake()
      stopGL = () => {
        cancelAnimationFrame(raf); raf = 0
        removeEventListener('scroll', onScroll); removeEventListener('resize', onResize)
        removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onMove)
        document.removeEventListener('pointerout', onOut); document.removeEventListener('visibilitychange', onVis)
        removeEventListener('cycle:tune', wake); removeEventListener('cycle:draw', drawNow); canvas.removeEventListener('webglcontextlost', onLost)
        texs.forEach((t) => gl.deleteTexture(t)); texs.clear()
        delete canvas.dataset.ready
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    }

    // ---- wiring that holds for every engine
    measure()
    // debug: ?debug=cycle&hold=1.5 opens pinned at that position, scrolled to where it would naturally be (stills)
    const held = debug ? new URLSearchParams(location.search).get('hold') : null
    if (held !== null) {
      const pos = Math.min(LAST, Math.max(0, +held)), k = Math.min(LAST, Math.floor(pos) + 1)
      tune.hold = pos
      // after the router's own scroll-to-top and the web fonts have settled
      setTimeout(() => { measure(); scrollTo(0, Math.max(0, tops[k] - innerHeight * 0.85 + (pos - Math.floor(pos)) * innerHeight * 0.7)) }, 700)
    }
    const ro = new ResizeObserver(() => { measure(); if (mode !== 'gl') cssScroll() })
    ro.observe(document.body)
    // the wall label steps aside as soon as the contact section comes up from the bottom
    const labelClear = () => { const c = tops[LAST], el = labelRef.current; if (c !== undefined && el) el.toggleAttribute('data-under', c - scrollY < innerHeight - 40) }
    const onScrollCss = () => { labelClear(); if (mode !== 'gl') cssScroll() }
    addEventListener('scroll', onScrollCss, { passive: true })
    cssScroll(); labelClear()

    if (reduce) toCss(300)
    else {
      // WebGL starts only once the hero image is in, so it never competes with the first paint (or the LCP)
      const hero = document.querySelector<HTMLImageElement>('.isle-img')
      const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(startGL, { timeout: 800 }) : setTimeout(startGL, 200))
      if (!hero || hero.complete) idle()
      else { hero.addEventListener('load', idle, { once: true }); hero.addEventListener('error', idle, { once: true }) }
    }

    return () => {
      dead = true
      stopGL?.()
      ro.disconnect()
      removeEventListener('scroll', onScrollCss)
      for (const k of Object.keys(vars)) root.style.removeProperty(k)
    }
  }, [debug])

  const s = stages[stage]
  return (
    <>
      <div className="cyc" aria-hidden data-engine={engine} style={{ '--cyc-fade': `${fade}ms` } as CSSProperties}>
        {engine !== 'gl' && (
          <div className="cyc-css">
            {stages.map((st, i) => {
              // before WebGL: only the painting on screen; in the fallback: also everything you've passed and the next one
              if (!st.img || (engine === 'pending' ? i !== stage : i > Math.max(seen, stage) + 1)) return null
              const f = bakedFocus(st), set = (ext: string) => `${st.img}-960.${ext} 960w, ${st.img}-1920.${ext} 1920w`
              return (
                <picture key={st.id}>
                  {!st.jpgOnly && <source type="image/avif" srcSet={set('avif')} sizes="100vw" />}
                  {!st.jpgOnly && <source type="image/webp" srcSet={set('webp')} sizes="100vw" />}
                  <img src={`${st.img}-1920.jpg`} srcSet={set('jpg')} sizes="100vw" alt="" decoding="async" className={i === stage ? 'on' : undefined} style={{ objectPosition: `${f.x * 100}% ${f.y * 100}%` }} />
                </picture>
              )
            })}
          </div>
        )}
        <canvas ref={canvasRef} className="cyc-canvas" />
      </div>
      <p ref={labelRef} className="cyc-label" data-side={s.textSide === 'left' ? 'right' : 'left'} data-off={s.id === 'contact' || undefined}>
        {s.id !== 'contact' && wallLabel(s, stage, lang)}
      </p>
      {debug && <CycleDebug live={live} engine={engine} stage={stage} />}
    </>
  )
}

/** Dev only (?debug=cycle): where the cycle is, how fast it draws, and sliders to tune it live. */
function CycleDebug({ live, engine, stage }: { live: React.MutableRefObject<{ p: number; t: number; fps: number }>; engine: Engine; stage: number }) {
  const out = useRef<HTMLPreElement>(null)
  const [, force] = useState(0)
  useEffect(() => {
    const id = setInterval(() => { if (out.current) out.current.textContent = `t ${live.current.t.toFixed(3)}  p ${live.current.p.toFixed(3)}\nfps ${live.current.fps}` }, 120)
    return () => clearInterval(id)
  }, [live])
  const slider = (k: keyof typeof tune, min: number, max: number, step: number) => (
    <label key={k}>{k} <b>{tune[k]}</b>
      <input type="range" min={min} max={max} step={step} value={tune[k]} onChange={(e) => { tune[k] = +e.target.value; force((n) => n + 1); dispatchEvent(new Event('cycle:tune')) }} />
    </label>
  )
  return (
    <div className="cyc-debug">
      <p>{engine} · {stages[stage].id}</p>
      <pre ref={out} />
      {slider('dot', 1, 8, 0.5)}
      {slider('glow', 0, 3, 0.05)}
      {slider('lens', 0, 400, 5)}
      {slider('lensPh', 0, 1, 0.01)}
      {slider('hold', -1, LAST, 0.01)}
    </div>
  )
}
