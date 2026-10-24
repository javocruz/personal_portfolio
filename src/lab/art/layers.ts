// layer('name') marks the start of a step in a painting. When painting up to `k` layers, the painting stops at the
// (k+1)th marker, which leaves it as it stood after k steps. Outside a run it is a no-op. Shared by the p5.brush
// paintings (paint.ts) and the plain Canvas 2D ones (rothko.ts, mondrian.ts).
const STOP = Symbol('stop')
let stopAt = Infinity, seen = 0
export function layer(_name: string) { if (++seen > stopAt) throw STOP }
/** How many layer() steps the last painting went through. */
export const lastLayerCount = () => seen
/** Runs `paint` and stops after `layers` steps (all of them by default). Returns how many steps it went through. */
export function runLayers(paint: () => void, layers = Infinity) {
  seen = 0; stopAt = layers
  try { paint() } catch (e) { if (e !== STOP) throw e } finally { stopAt = Infinity }
  return seen
}
