import { rng, type Sketch } from './paint'

/** A sheet of ink doodle faces, each unique. Wobble comes from p5.brush's hand field; variety from a seeded RNG. */
// <faces>
export const faceSheet: Sketch = (b, W, H) => {
  const R = rng(77)
  const cols = 6, rows = 8
  const cw = W / cols, ch = H / rows
  b.field('hand')
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = c * cw + cw / 2, cy = r * ch + ch / 2
    const s = Math.min(cw, ch) * 0.34 * (0.85 + R() * 0.3)
    const wide = 0.8 + R() * 0.4
    // head: a wobbly closed loop
    const head: [number, number][] = []
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const k = 1 + (R() - 0.5) * 0.14; head.push([cx + Math.cos(a) * s * wide * k, cy + Math.sin(a) * s * (a > 0 && a < Math.PI ? 1.08 : 0.95) * k]) }
    b.set('rotring', '#1a1511', 0.9); b.noFill(); b.spline([...head, head[0], head[1]], 1)
    // eyes (dots, ticks, or glasses) and brows
    const ey = cy - s * 0.12, ex = s * wide * 0.4
    const glasses = R() < 0.22
    for (const sd of [-1, 1]) {
      if (glasses) b.circle(cx + sd * ex, ey, s * 0.2)
      else { b.set('2B', '#1a1511', 1); b.circle(cx + sd * ex, ey, 1.2 + R() * 2) }
      b.set('pen', '#1a1511', 0.8); b.line(cx + sd * ex - 6, ey - s * 0.22 - R() * 4, cx + sd * ex + 6, ey - s * 0.2 + R() * 4)
    }
    if (glasses) b.line(cx - ex + s * 0.2, ey, cx + ex - s * 0.2, ey)
    // nose and mouth
    b.set('pen', '#1a1511', 0.8)
    b.line(cx, ey + 2, cx + (R() - 0.5) * 8, cy + s * 0.22)
    const my = cy + s * 0.5, mw = s * (0.15 + R() * 0.3), smile = (R() - 0.35) * s * 0.2
    b.spline([[cx - mw, my], [cx, my + smile], [cx + mw, my]], 1)
    // hair, hat or bald
    const hair = R()
    if (hair < 0.62) { b.set('2B', '#1a1511', 0.9); for (let i = 0; i < 14 + (R() * 14 | 0); i++) { const a = Math.PI + (i / 22) * Math.PI + (R() - 0.5) * 0.2; b.line(cx + Math.cos(a) * s * wide * 0.95, cy + Math.sin(a) * s * 0.9, cx + Math.cos(a) * s * wide * (1.25 + R() * 0.3), cy + Math.sin(a) * s * (1.2 + R() * 0.4)) } }
    else if (hair < 0.82) { b.set('charcoal', '#1a1511', 0.8); b.line(cx - s * wide * 1.1, cy - s * 0.78, cx + s * wide * 1.1, cy - s * 0.78); b.noStroke(); b.fill('#1a1511', 120); b.rect(cx - s * wide * 0.7, cy - s * 1.35, s * wide * 1.4, s * 0.58); b.noFill() }
    if (R() < 0.3) { b.set('pen', '#1a1511', 0.6); b.hatch(3, 45, { rand: 0.2 }); b.noStroke(); b.noFill(); b.noHatch() }
  }
  b.noField()
}
// </faces>
