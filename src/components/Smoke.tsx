import { useEffect, useRef } from 'react'

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
// Domain-warped fbm ("folding noise into itself"), mapped to black → blue → red, with a little grain.
const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r.y;float s=t*.035;
  vec2 q=vec2(fbm(uv*1.6+s),fbm(uv*1.6+vec2(5.2,1.3)-s));
  vec2 w=vec2(fbm(uv*1.6+3.*q+vec2(1.7,9.2)+s*1.3),fbm(uv*1.6+3.*q+vec2(8.3,2.8)-s));
  float f=fbm(uv*1.6+3.2*w);
  vec3 c=mix(vec3(0.),vec3(.09,.13,.62),smoothstep(.25,.75,f));
  c=mix(c,vec3(.95,.2,.15),smoothstep(.55,.95,f*length(w)*1.1));
  c+=(h(gl_FragCoord.xy+t)-.5)*.06;
  gl_FragColor=vec4(c,1.);
}`

/**
 * Slow red/blue smoke, drawn by one small WebGL shader. Renders at half resolution, pauses when off screen or in a
 * background tab, and draws a single still frame for people who prefer reduced motion.
 */
export function Smoke({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!, gl = c.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, visible = true, t0 = performance.now() - 20000
    const size = () => { c.width = Math.max(1, c.clientWidth * 0.5); c.height = Math.max(1, c.clientHeight * 0.5); gl.viewport(0, 0, c.width, c.height) }
    const frame = () => {
      gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, (performance.now() - t0) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = !still && visible ? requestAnimationFrame(frame) : 0
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame) })
    const ro = new ResizeObserver(() => { size(); if (!raf) frame() })
    io.observe(c); ro.observe(c); size(); frame()
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, [])
  return <canvas ref={ref} className={`smoke ${className}`} aria-hidden />
}
