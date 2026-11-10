import { fbm, noise, rng, type PondDef } from './kit'
import { acc, ink, MONO } from './auto'

/**
 * Project art in the site's own voice: ink, dots, lines and glyphs on the dark ground, one accent. Each drawing is
 * built from what its project does, and any figure written on one is a real one from that project.
 * Drawn once, on a 600 x 750 board scaled to the canvas; the seeds are fixed, so each is the same drawing every time.
 */
type Ctx = CanvasRenderingContext2D
const TAU = Math.PI * 2
const text = (c: Ctx, s: string, x: number, y: number, a = 0.45, size = 10.5, align: CanvasTextAlign = 'left') => {
  c.font = `${size}px ${MONO}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = ink(a); c.fillText(s, x, y)
}
const dot = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill() }
/** Adds the level line of f over a box to a path, as short segments (marching squares); `keep` can drop some for a dashed look. */
const contour = (p: Path2D, f: (x: number, y: number) => number, L: number, x0: number, y0: number, x1: number, y1: number, G: number, keep?: (i: number, j: number) => boolean) => {
  for (let y = y0, j = 0; y < y1; y += G, j++) for (let x = x0, i = 0; x < x1; x += G, i++) {
    if (keep && !keep(i, j)) continue
    const a = f(x, y), b = f(x + G, y), c = f(x + G, y + G), d = f(x, y + G), pts: number[] = []
    if ((a > L) !== (b > L)) pts.push(x + ((L - a) / (b - a)) * G, y)
    if ((b > L) !== (c > L)) pts.push(x + G, y + ((L - b) / (c - b)) * G)
    if ((d > L) !== (c > L)) pts.push(x + ((L - d) / (c - d)) * G, y + G)
    if ((a > L) !== (d > L)) pts.push(x, y + ((L - a) / (d - a)) * G)
    for (let k = 0; k + 3 < pts.length; k += 4) { p.moveTo(pts[k], pts[k + 1]); p.lineTo(pts[k + 2], pts[k + 3]) }
  }
}

/* SnapFrost: a clear night over the furrows. The cold pools in the low middle of the field, where the plants turn to
   crystals; across it runs the night's forecast and its real error band, dipping under the zero line. */
const snapfrost = (c: Ctx) => {
  const r = rng(358)
  const far = (x: number) => 316 - 52 * noise(x * 0.011, 1.5) - 14 * noise(x * 0.05, 4), near = (x: number) => 332 - 22 * noise(x * 0.02, 7)
  for (let i = 0; i < 520; i++) {
    const x = r() * 600, y = r() * 320, d = y - (40 + x * 0.36)
    if (y > far(x) - 5 || r() > 0.3 + 0.7 * Math.exp(-(d * d) / 2600)) continue
    c.fillStyle = ink(0.2 + r() * 0.65); const s = r() < 0.05 ? 2 : 1; c.fillRect(x, y, s, s)
  }
  c.fillStyle = ink(0.92); dot(c, 452, 104, 8)
  c.strokeStyle = ink(0.24); c.lineWidth = 1; c.setLineDash([2, 5]); c.beginPath(); c.arc(452, 104, 46, 0, TAU); c.stroke(); c.setLineDash([])
  for (const [f, a] of [[far, 0.5], [near, 0.28]] as const) { c.strokeStyle = ink(a); c.beginPath(); for (let x = 0; x <= 600; x += 4) c.lineTo(x, f(x)); c.stroke() }
  // the furrows, running to a point on the horizon; plants are dots, frosted ones are crystals
  for (let k = -9; k <= 9; k++) for (let j = 5; j <= 26; j++) {
    const t = (j / 26) ** 1.8, x = 300 + k * 62 * t, y = 334 + (750 - 334) * t
    if (x < -10 || x > 610) continue
    const cold = Math.exp(-(((x - 300) / 215) ** 2 + ((y - 600) / 125) ** 2)) + (noise(x * 0.03, y * 0.03) - 0.5) * 0.35
    if (cold > 0.48) {
      const q = 1.6 + 4.2 * t; c.strokeStyle = ink(0.92); c.lineWidth = 0.9; c.beginPath()
      for (let a = 0; a < 3; a++) { const an = (a * Math.PI) / 3 + k; c.moveTo(x - Math.cos(an) * q, y - Math.sin(an) * q); c.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q) }
      c.stroke()
    } else { c.fillStyle = ink(0.42); dot(c, x, y, 0.6 + 2.2 * t) }
  }
  // the night's minimum, forecast with its real error (± 1.29 °C over 358 nights), against 0 °C
  const T = (x: number) => 4.2 - 6.9 * Math.exp(-(((x - 330) / 118) ** 2)) + 0.35 * Math.sin(x * 0.05), Y = (v: number) => 468 - v * 16
  c.strokeStyle = acc(0.85); c.lineWidth = 1; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(56, Y(0)); c.lineTo(520, Y(0)); c.stroke(); c.setLineDash([])
  c.font = `10.5px ${MONO}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = acc(0.9); c.fillText('0 °C', 528, Y(0))
  c.strokeStyle = ink(0.3); c.setLineDash([1, 4])
  for (const e of [-1.29, 1.29]) { c.beginPath(); for (let x = 56; x <= 520; x += 4) c.lineTo(x, Y(T(x) + e)); c.stroke() }
  c.setLineDash([])
  for (const below of [false, true]) {
    c.strokeStyle = below ? acc() : ink(0.9); c.lineWidth = below ? 2 : 1.4; c.beginPath()
    let pen = false
    for (let x = 56; x <= 520; x += 2) { if ((T(x) < 0) === below) { if (pen) c.lineTo(x, Y(T(x))); else c.moveTo(x, Y(T(x))); pen = true } else pen = false }
    c.stroke()
  }
  text(c, '22:00', 56, Y(T(56)) - 16); text(c, '06:00', 520, Y(T(520)) - 16, 0.45, 10.5, 'right'); text(c, 'forecast ± 1.29 °C', 56, 716)
}

/* Los Panaderos: one fire, two maps. On the left the ground truth; on the right only what the sensors have reported,
   a perimeter that lags the real one, and the units sent out on that belief. */
const panaderos = (c: Ctx) => {
  const r = rng(36)
  const land = (x: number, y: number) => fbm(x * 0.006 + 3, y * 0.006 + 8)
  const F = (x: number, y: number) => 1 - Math.hypot((x - 292) / 200, (y - 390) / 160) + (fbm(x * 0.012 + 20, y * 0.012) - 0.5) * 0.95
  const topo = new Path2D()
  for (let L = 0.3; L < 0.72; L += 0.05) contour(topo, land, L, 0, 0, 600, 750, 10)
  c.strokeStyle = ink(0.15); c.lineWidth = 0.8; c.stroke(topo)
  // left: the truth. Ash where it has burnt, the front in the accent, embers ahead of it
  for (let y = 60; y < 700; y += 9) for (let x = 12; x < 296; x += 9) {
    const f = F(x, y)
    if (f > 0.2) { if ((x + y) % 2 === 0) { c.fillStyle = ink(0.34); c.fillRect(x, y, 2, 2) } }
    else if (f > 0) { c.fillStyle = acc(0.55 + r() * 0.45); const s = 3 + r() * 4; c.fillRect(x - s / 2 + 1, y - s / 2 + 1, s, s) }
    else if (f > -0.12 && r() < 0.1) { c.fillStyle = acc(0.8); c.fillRect(x, y, 1.6, 1.6) }
  }
  const truth = new Path2D(), ghost = new Path2D(), known = new Path2D()
  contour(truth, F, 0, 0, 40, 300, 720, 6); contour(ghost, F, 0, 300, 40, 600, 720, 6, (i, j) => (i + j) % 3 === 0)
  contour(known, (x, y) => F(x, y) - 0.24, 0, 300, 40, 600, 720, 6, (i, j) => (i + j) % 2 === 0)
  c.strokeStyle = ink(0.75); c.lineWidth = 1.2; c.stroke(truth)
  c.strokeStyle = ink(0.22); c.lineWidth = 1; c.stroke(ghost)
  c.strokeStyle = ink(0.9); c.lineWidth = 1.4; c.stroke(known)
  // right: the sensors, lit where they have seen fire
  for (let y = 84; y < 700; y += 58) for (let x = 330; x < 590; x += 58) {
    const sx = x + (r() - 0.5) * 22, sy = y + (r() - 0.5) * 22
    if (F(sx, sy) > 0.02) { c.fillStyle = acc(); dot(c, sx, sy, 3.4); c.strokeStyle = acc(0.4); c.lineWidth = 1; c.beginPath(); c.arc(sx, sy, 8, 0, TAU); c.stroke() }
    else { c.strokeStyle = ink(0.5); c.lineWidth = 1; c.beginPath(); c.arc(sx, sy, 3.2, 0, TAU); c.stroke() }
  }
  // the units, routed to the fire the system believes in
  c.strokeStyle = ink(0.85); c.lineWidth = 1.2; c.strokeRect(521, 655, 11, 11); text(c, 'base', 540, 661)
  const routes: [number, number, number, number, boolean][] = [[420, 600, 392, 470, false], [560, 520, 452, 372, false], [470, 690, 356, 560, true]]
  for (const [mx, my, ex, ey, truck] of routes) {
    c.strokeStyle = ink(0.5); c.lineWidth = 1; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(526, 660); c.quadraticCurveTo(mx, my, ex, ey); c.stroke(); c.setLineDash([])
    c.fillStyle = ink(0.95)
    if (truck) c.fillRect(ex - 4, ey - 3, 8, 6); else { c.beginPath(); c.moveTo(ex, ey - 5); c.lineTo(ex + 4.5, ey + 4); c.lineTo(ex - 4.5, ey + 4); c.fill() }
  }
  c.strokeStyle = ink(0.3); c.setLineDash([1, 5]); c.beginPath(); c.moveTo(300, 50); c.lineTo(300, 712); c.stroke(); c.setLineDash([])
  text(c, 'ground truth', 290, 34, 0.5, 10.5, 'right'); text(c, 'what the system knows', 310, 34, 0.5)
  c.strokeStyle = ink(0.5); c.lineWidth = 1; c.beginPath(); c.moveTo(40, 690); c.lineTo(84, 668); c.moveTo(84, 668); c.lineTo(75, 668); c.moveTo(84, 668); c.lineTo(80, 676); c.stroke(); text(c, 'wind', 40, 708)
}

/* Sybol: an image's fingerprint. The left half is whole; the right has been cut into bands, shifted, and lost pieces.
   Below, the engine's verdict on its scale from deepfake to authentic, and the signature that seals it. */
const sybol = (c: Ctx) => {
  const r = rng(77), cx = 300, cy = 312
  const band = (y: number) => Math.floor(y / 13), hb = (k: number) => noise(k * 7.31, 2.5)
  for (let R = 16; R <= 246; R += 6) {
    c.beginPath()
    let last = -999, pen = false
    for (let k = 0; k <= 240; k++) {
      const a = (k / 240) * TAU, rad = R + 6 * (noise(Math.cos(a) * 1.5 + R * 0.021, Math.sin(a) * 1.5 + 9) - 0.5) * (0.4 + R / 110)
      let x = cx + Math.cos(a) * rad
      const y = cy + Math.sin(a) * rad * 1.05
      if (x > cx) {
        const b = band(y)
        if (hb(b + 50) < 0.3) { pen = false; continue }
        x += (hb(b) - 0.5) * 46 * Math.min(1, (x - cx) / 26)
        if (b !== last) pen = false
        last = b
      } else last = -999
      if (pen) c.lineTo(x, y); else c.moveTo(x, y)
      pen = true
    }
    c.strokeStyle = ink(0.62); c.lineWidth = 1; c.stroke()
  }
  c.strokeStyle = ink(0.28); c.setLineDash([1, 5]); c.beginPath(); c.moveTo(cx, 44); c.lineTo(cx, 590); c.stroke(); c.setLineDash([])
  text(c, 'authentic', 290, 30, 0.5, 10.5, 'right'); text(c, 'tampered', 310, 30, 0.5)
  // the score, 0 to 1
  c.strokeStyle = ink(0.45); c.lineWidth = 1; c.beginPath(); c.moveTo(110, 640); c.lineTo(490, 640)
  for (let k = 0; k <= 10; k++) { c.moveTo(110 + k * 38, 640); c.lineTo(110 + k * 38, k % 5 ? 645 : 649) }
  c.stroke()
  const sx = 110 + 0.64 * 380
  c.strokeStyle = acc(); c.lineWidth = 1.4; c.beginPath(); c.moveTo(sx, 618); c.lineTo(sx, 640); c.stroke()
  c.fillStyle = acc(); c.beginPath(); c.moveTo(sx, 640); c.lineTo(sx - 5, 630); c.lineTo(sx + 5, 630); c.fill()
  c.font = `11px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('0.64', sx, 608)
  text(c, '0 · deepfake', 110, 664); text(c, 'authentic · 1', 490, 664, 0.45, 10.5, 'right')
  // the signature
  for (let k = 0; k < 48; k++) { const x = 110 + k * 7.94; if (r() < 0.5) { c.fillStyle = ink(0.75); c.fillRect(x, 696, 5, 5) } else { c.strokeStyle = ink(0.28); c.lineWidth = 0.8; c.strokeRect(x + 0.5, 696.5, 4, 4) } }
  text(c, 'signed · w3c verifiable credential', 110, 722)
}

/* Pharmable: a document read line by line against the rules. Three findings, each with its severity and the clause it
   breaks; underneath, the audit trail, every block chained to the one before. */
const pharmable = (c: Ctx) => {
  const r = rng(211)
  c.strokeStyle = ink(0.55); c.lineWidth = 1
  c.beginPath(); c.moveTo(120, 60); c.lineTo(408, 60); c.lineTo(430, 82); c.lineTo(430, 540); c.lineTo(120, 540); c.closePath(); c.moveTo(408, 60); c.lineTo(408, 82); c.lineTo(430, 82); c.stroke()
  const flags: Record<number, [string, string]> = { 7: ['critical', '21 CFR 11.10(e)'], 18: ['major', 'EU GMP Annex 11 §9'], 28: ['minor', 'ICH E3 §12.2'] }
  for (let row = 0, y = 98; y < 524; row++, y += 12.4) {
    if (row % 10 === 0) { c.fillStyle = ink(0.78); c.fillRect(146, y - 1, 80 + r() * 70, 3); continue }
    const flag = flags[row], end = r() < 0.18 ? 250 + r() * 100 : 404
    c.fillStyle = flag ? acc(0.95) : ink(0.3)
    for (let x = 146; x < end - 12;) { const wl = Math.min(end - x, 10 + r() * 38); c.fillRect(x, y, wl, 2); x += wl + 6 }
    if (!flag) continue
    c.fillStyle = acc()
    if (flag[0] === 'critical') c.fillRect(129, y - 2.5, 7, 7)
    else if (flag[0] === 'major') { c.beginPath(); c.moveTo(132.5, y - 3.5); c.lineTo(137, y + 4.5); c.lineTo(128, y + 4.5); c.fill() }
    else dot(c, 132.5, y + 1, 3.4)
    c.strokeStyle = acc(0.7); c.beginPath(); c.moveTo(430, y + 1); c.lineTo(450, y + 1); c.stroke()
    text(c, flag[1], 456, y + 1, 0.82); text(c, flag[0], 456, y + 15, 0.42, 9.5)
  }
  // the audit trail: an append-only chain of hashes
  c.strokeStyle = ink(0.3); c.setLineDash([1, 4]); c.beginPath(); c.moveTo(275, 540); c.lineTo(275, 588); c.lineTo(121, 588); c.lineTo(121, 606); c.stroke(); c.setLineDash([])
  const HEX = '0123456789abcdef'
  for (let k = 0; k < 6; k++) {
    const x = 98 + k * 70
    c.strokeStyle = k === 5 ? acc() : ink(0.55); c.lineWidth = 1; c.strokeRect(x + 0.5, 606.5, 46, 46)
    for (let j = 0; j < 3; j++) { let s = ''; for (let q = 0; q < 6; q++) s += HEX[Math.floor(r() * 16)]; text(c, s, x + 23, 618 + j * 11.5, k === 5 ? 0.8 : 0.4, 8, 'center') }
    if (k < 5) { c.strokeStyle = ink(0.55); c.beginPath(); c.moveTo(x + 47, 629.5); c.lineTo(x + 70, 629.5); c.moveTo(x + 65, 626); c.lineTo(x + 70, 629.5); c.lineTo(x + 65, 633); c.stroke() }
  }
  text(c, 'append-only audit trail · sha-256', 98, 678)
}

/* Frutas Prohibidas: the forbidden fruit in halftone, a bite taken out, and the receipt every order prints: what it
   cost in carbon, water and land. */
const frutas = (c: Ctx) => {
  const cx = 300, cy = 286, R = 166, lx = -0.5, ly = -0.6, lz = 0.624
  for (let j = 0, y = cy - R; y <= cy + R; y += 9.5, j++) for (let x = cx - R + (j % 2 ? 5.5 : 0); x <= cx + R; x += 11) {
    const nx = (x - cx) / R, ny = (y - cy) / R, d = nx * nx + ny * ny
    if (d >= 1 || Math.hypot(x - 424, y - 186) < 76) continue
    const shade = Math.max(0, nx * lx + ny * ly + Math.sqrt(1 - d) * lz), hot = Math.abs(x - 258) < 5.6 && Math.abs(y - 239) < 4.8
    c.fillStyle = hot ? acc() : ink(0.86); dot(c, x, y, hot ? 5.4 : 0.7 + 4.4 * shade ** 1.2)
  }
  c.strokeStyle = ink(0.85); c.lineWidth = 2; c.beginPath(); c.moveTo(298, 124); c.quadraticCurveTo(300, 96, 320, 74); c.stroke()
  c.lineWidth = 1; c.strokeStyle = ink(0.7); c.beginPath(); c.moveTo(318, 92); c.quadraticCurveTo(352, 56, 396, 66); c.quadraticCurveTo(366, 102, 318, 92); c.stroke()
  c.strokeStyle = ink(0.4); c.beginPath(); for (let k = 1; k <= 5; k++) { const x = 318 + k * 12; c.moveTo(x, 90 - k * 3.4); c.lineTo(x + 9, 71 - k * 0.6) } c.stroke()
  c.strokeStyle = ink(0.3); c.setLineDash([1, 4]); c.beginPath(); c.moveTo(300, 458); c.lineTo(300, 498); c.stroke(); c.setLineDash([])
  // the receipt
  c.strokeStyle = ink(0.55); c.lineWidth = 1; c.beginPath(); c.moveTo(196, 706); c.lineTo(196, 500); c.lineTo(404, 500); c.lineTo(404, 706)
  for (let x = 404, k = 0; x > 196; x -= 8, k++) c.lineTo(x - 8, k % 2 ? 706 : 713)
  c.stroke()
  text(c, 'frutas prohibidas', 300, 522, 0.85, 10.5, 'center')
  c.strokeStyle = ink(0.35); c.setLineDash([2, 3]); c.beginPath(); c.moveTo(210, 538); c.lineTo(390, 538); c.moveTo(210, 652); c.lineTo(390, 652); c.stroke(); c.setLineDash([])
  text(c, '1 × order', 210, 558, 0.7)
  ;[['co₂', 'kg'], ['h₂o', 'l'], ['land', 'm²']].forEach(([k, unit], i) => {
    const y = 586 + i * 22
    c.fillStyle = acc(); c.fillRect(210, y - 2.5, 5, 5)
    text(c, k, 222, y, 0.8); text(c, unit, 390, y, 0.8, 10.5, 'right')
    c.strokeStyle = ink(0.3); c.setLineDash([1, 4]); c.beginPath(); c.moveTo(256, y + 3); c.lineTo(366, y + 3); c.stroke(); c.setLineDash([])
  })
  text(c, 'impact, per order', 300, 674, 0.45, 10.5, 'center')
}

const plate = (id: string, name: string, idea: string, draw: (c: Ctx) => void): PondDef => ({
  id: `plate-${id}`, name, tags: ['project art', 'still'], idea, hint: 'a still drawing', bg: '#1a1917', passive: true, aspect: '4/5',
  make(ctx, w, h) {
    let done = false
    document.fonts?.ready.then(() => { done = false })
    return {
      frame() {
        if (done) return
        done = true
        ctx.clearRect(0, 0, w, h); ctx.save(); ctx.scale(w / 600, w / 600); draw(ctx); ctx.restore()
      },
    }
  },
})

export const PLATE_PONDS: PondDef[] = [
  plate('snapfrost', 'SnapFrost', 'A clear night over the furrows. The cold pools mid-field, where plants turn to crystals; the forecast and its real ±1.29 °C error band dip under the zero line.', snapfrost),
  plate('los-panaderos', 'Los Panaderos', 'One fire, two maps: the ground truth on the left; on the right, only what the sensors report, a perimeter that lags the real one, and the units sent out on that belief.', panaderos),
  plate('sybol', 'Sybol Compliance Engine', 'An image’s fingerprint, whole on one side, cut into bands and shifted on the other. Below, the score from deepfake to authentic and the signature that seals it.', sybol),
  plate('pharmable', 'Pharmable', 'A document read line by line against the rules: three findings with severity and clause, and the hash-chained audit trail underneath.', pharmable),
  plate('frutas-prohibidas', 'Frutas Prohibidas', 'The forbidden fruit in halftone with a bite out, and the receipt each order prints: its cost in carbon, water and land.', frutas),
]
