// Generates the eye favicon: an original vector eye with a burst of rays. Run: node scripts/make-favicon.mjs
import { writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

let seed = 11
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

const S = 64, C = S / 2
const rays = []
const N = 64
for (let i = 0; i < N; i++) {
  const a = (i / N) * Math.PI * 2 + (rnd() - 0.5) * 0.05
  const r0 = 12 + rnd() * 2
  const r1 = 20 + Math.pow(rnd(), 0.8) * 10.5 + (rnd() < 0.12 ? 2 : 0)
  const w = 0.5 + rnd() * 0.9
  const x0 = C + Math.cos(a) * r0, y0 = C + Math.sin(a) * r0
  const x1 = C + Math.cos(a) * r1, y1 = C + Math.sin(a) * r1
  rays.push(`<line x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${y1.toFixed(2)}" stroke="url(#g)" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`)
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
<defs><radialGradient id="g" gradientUnits="userSpaceOnUse" cx="${C}" cy="${C}" r="32"><stop offset=".35" stop-color="#e2792e"/><stop offset=".7" stop-color="#f0b955"/><stop offset="1" stop-color="#ffe3a0"/></radialGradient>
<clipPath id="e"><path d="M${C - 11} ${C}Q${C} ${C - 11} ${C + 11} ${C}Q${C} ${C + 9} ${C - 11} ${C}Z"/></clipPath></defs>
<rect width="${S}" height="${S}" rx="14" fill="#07060a"/>
${rays.join('\n')}
<path d="M${C - 11} ${C}Q${C} ${C - 11} ${C + 11} ${C}Q${C} ${C + 9} ${C - 11} ${C}Z" fill="#e9e3d8"/>
<g clip-path="url(#e)"><circle cx="${C}" cy="${C}" r="5.6" fill="#5e7f94"/><circle cx="${C}" cy="${C}" r="5.6" fill="none" stroke="#10181f" stroke-width="1"/><circle cx="${C}" cy="${C}" r="2.3" fill="#030507"/><circle cx="${C - 1.7}" cy="${C - 1.9}" r="1" fill="#fff"/><path d="M${C - 11} ${C}Q${C} ${C - 11} ${C + 11} ${C}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3"/></g>
<path d="M${C - 11} ${C}Q${C} ${C - 11} ${C + 11} ${C}" fill="none" stroke="#0a0605" stroke-width="1.3" stroke-linecap="round"/>
</svg>`
writeFileSync('public/favicon.svg', svg)
for (const [px, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
  writeFileSync(`public/${name}`, new Resvg(svg, { fitTo: { mode: 'width', value: px } }).render().asPng())
}
console.log('wrote favicon.svg, favicon-32.png, apple-touch-icon.png')
