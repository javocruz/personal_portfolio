import { useRef, type ReactNode } from 'react'

/**
 * A painting shown as 1-bit blue dither until you hover it; colour then takes over dot by dot, outward from where the
 * cursor came in, and the dither comes back the same way when it leaves. Both images are pre-rendered; the dots are
 * drawn by one small WebGL canvas that is shared by every plate and only ever sits on the plate being hovered.
 * With reduced motion (or no WebGL) it is a quick CSS fade instead.
 */
export function DitherReveal({ children, dither, className = '' }: { children: ReactNode; dither: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const at = (e: React.PointerEvent) => { const b = box.current!.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top] as const }
  const enter = (e: React.PointerEvent) => { if (e.pointerType === 'mouse' && !fx.enter(box.current!, at(e))) box.current!.dataset.fx = 'fade' }
  const leave = (e: React.PointerEvent) => { if (e.pointerType === 'mouse') fx.leave(box.current!, at(e)) }
  return (
    <div ref={box} className={`dither-reveal ${className}`} onPointerEnter={enter} onPointerLeave={leave}>
      {children}
      <img className="dither-layer" src={dither} alt="" aria-hidden loading="lazy" />
    </div>
  )
}

const VERT = '#version 300 es\nlayout(location=0) in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
// Each dot of the dither layer stays until a ragged front (distance + Bayer + a little noise) passes it.
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uD;
uniform vec2 uRes, uIn, uOut;  // device px; where the cursor came in / went out (y down)
uniform float uDot, uP, uQ;    // dot size; colour coming in (0..1); dither coming back (0..1)
out vec4 o;
float bayer8(ivec2 p){int x=p.x&7,y=p.y&7,xc=x^y;
  int v=((xc&1)<<5)|((y&1)<<4)|((xc&2)<<2)|((y&2)<<1)|((xc&4)>>1)|((y&4)>>2);return (float(v)+.5)/64.;}
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float front(vec2 c, vec2 from){
  vec2 far=max(from,uRes-from);
  return length(c-from)/length(far)*.8+(bayer8(ivec2(c/uDot))-.5)*.24+(n(c/uRes*6.)-.5)*.18+.14;
}
void main(){
  vec2 px=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  vec2 c=(floor(px/uDot)+.5)*uDot;
  // linear in time: the front sweeps the whole plate evenly over the ~450ms
  bool dither=front(c,uIn)>uP*1.3-.1||front(c,uOut)<uQ*1.3-.1;
  vec4 d=texture(uD,px/uRes);
  o=dither?vec4(d.rgb,1.):vec4(0.);
}`

/** The one shared overlay. Returns false from enter() when it can't run, so the plate falls back to the CSS fade. */
const fx = (() => {
  let gl: WebGL2RenderingContext | null | undefined, canvas: HTMLCanvasElement
  let U: Record<string, WebGLUniformLocation | null> = {}
  const texs = new Map<string, WebGLTexture>()
  let owner: HTMLElement | null = null, raf = 0, P = 0, Q = 0
  // one tween at a time: P (colour coming in) or Q (dither coming back), from → to
  let anim = { key: 'P' as 'P' | 'Q', from: 0, to: 1, t0: 0, dur: 1 }
  const pos = { in: [0, 0], out: [0, 0] }
  const DUR = 450

  const init = () => {
    if (gl !== undefined) return gl
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return (gl = null)
    canvas = document.createElement('canvas'); canvas.className = 'plate-fx'; canvas.setAttribute('aria-hidden', 'true')
    gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true, depth: false })
    if (!gl) return (gl = null)
    const g = gl
    const sh = (t: number, s: string) => { const x = g.createShader(t)!; g.shaderSource(x, s); g.compileShader(x); return x }
    const prog = g.createProgram()!
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT)); g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG)); g.linkProgram(prog)
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return (gl = null)
    g.useProgram(prog)
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
    g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0)
    U = Object.fromEntries(['uRes', 'uIn', 'uOut', 'uDot', 'uP', 'uQ'].map((k) => [k, g.getUniformLocation(prog, k)]))
    return gl
  }

  const texture = (img: HTMLImageElement) => {
    const g = gl!
    let t = texs.get(img.src)
    if (!t) {
      t = g.createTexture()!
      g.bindTexture(g.TEXTURE_2D, t)
      // the dither is pixel art: nearest, never smoothed
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img)
      texs.set(img.src, t)
    }
    g.bindTexture(g.TEXTURE_2D, t)
  }

  const play = (key: 'P' | 'Q', to: number) => {
    const from = key === 'P' ? P : Q
    anim = { key, from, to, t0: performance.now(), dur: Math.max(120, DUR * Math.abs(to - from)) }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(draw)
  }

  const detach = () => { cancelAnimationFrame(raf); raf = 0; canvas.remove(); if (owner) delete owner.dataset.live; owner = null }

  const draw = () => {
    const k = Math.min(1, (performance.now() - anim.t0) / anim.dur), v = anim.from + (anim.to - anim.from) * k
    if (anim.key === 'P') P = v; else Q = v
    const g = gl!, dpr = canvas.width / canvas.clientWidth
    g.uniform2f(U.uRes, canvas.width, canvas.height)
    g.uniform2f(U.uIn, pos.in[0] * dpr, pos.in[1] * dpr); g.uniform2f(U.uOut, pos.out[0] * dpr, pos.out[1] * dpr)
    g.uniform1f(U.uDot, 2.5 * dpr); g.uniform1f(U.uP, P); g.uniform1f(U.uQ, Q)
    g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.drawArrays(g.TRIANGLES, 0, 3)
    if (k < 1) raf = requestAnimationFrame(draw)
    else { raf = 0; if (Q >= 1) detach(); else if (anim.key === 'Q' && P < 1) play('P', 1) }
  }

  return {
    enter(box: HTMLElement, at: readonly [number, number]) {
      const img = box.querySelector<HTMLImageElement>('.dither-layer')
      if (!init() || !img?.complete || !img.naturalWidth) return false
      if (owner !== box) {
        if (owner) detach()
        owner = box
        const dpr = Math.min(devicePixelRatio || 1, 2)
        canvas.width = Math.round(box.clientWidth * dpr); canvas.height = Math.round(box.clientHeight * dpr)
        gl!.viewport(0, 0, canvas.width, canvas.height)
        box.appendChild(canvas); box.dataset.live = ''
        texture(img)
        P = Q = 0
      }
      // back before the dither had fully returned: rewind it along the same front; otherwise bring the colour in
      if (Q > 0) play('Q', 0)
      else { pos.in = [...at]; play('P', 1) }
      return true
    },
    leave(box: HTMLElement, at: readonly [number, number]) {
      if (owner !== box) return
      pos.out = [...at]
      play('Q', 1)
    },
  }
})()
