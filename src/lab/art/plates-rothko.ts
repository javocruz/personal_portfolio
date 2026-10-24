/**
 * Core, Rothko style: the plate wrappers. Each plate is a few layer('…') steps over the generator in rothko.ts, so
 * the Technique section can show the steps and the painting as it stood after each one.
 * Seeds live in content/art.ts (CORE_SEEDS), picked on /lab/plates.
 */
import { layer } from './layers'
import { rothko, type ProjectId } from './rothko'
import { CORE_SEEDS } from '../../content/art'

export type Paint2D = (ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) => void

// <plate:frost>
// SnapFrost: night over frost. The two field heights are the two forecast errors, 1.50 : 1.29.
export const rothkoFrost: Paint2D = (ctx, W, H, seed) => {
  const p = rothko(ctx, W, H, 'frost', seed)
  layer('Ground stain'); p.ground()
  layer('Underlayer'); p.underlayer()
  layer('Field 1'); p.field(0)
  layer('Field 2'); p.field(1)
  layer('Scumble'); p.scumble()
  layer('Surface'); p.surface()
}
// </plate:frost>

// <plate:maps>
// Los Panaderos: the fire, and what the control room knows 12 steps later.
export const rothkoMaps: Paint2D = (ctx, W, H, seed) => {
  const p = rothko(ctx, W, H, 'maps', seed)
  layer('Ground stain'); p.ground()
  layer('Underlayer'); p.underlayer()
  layer('Field 1'); p.field(0)
  layer('Field 2'); p.field(1)
  layer('Scumble'); p.scumble()
  layer('Surface'); p.surface()
}
// </plate:maps>

// <plate:iris>
// Sybol: authentic blue, a thin violet band where the score falls, synthetic red.
export const rothkoIris: Paint2D = (ctx, W, H, seed) => {
  const p = rothko(ctx, W, H, 'iris', seed)
  layer('Ground stain'); p.ground()
  layer('Underlayer'); p.underlayer()
  layer('Field 1'); p.field(0)
  layer('Field 2'); p.field(1)
  layer('Field 3'); p.field(2)
  layer('Scumble'); p.scumble()
  layer('Surface'); p.surface()
}
// </plate:iris>

// <plate:chain>
// Pharmable: an ochre ledger with one thin crimson band, the critical finding.
export const rothkoChain: Paint2D = (ctx, W, H, seed) => {
  const p = rothko(ctx, W, H, 'chain', seed)
  layer('Ground stain'); p.ground()
  layer('Underlayer'); p.underlayer()
  layer('Field 1'); p.field(0)
  layer('Field 2'); p.field(1)
  layer('Field 3'); p.field(2)
  layer('Scumble'); p.scumble()
  layer('Surface'); p.surface()
}
// </plate:chain>

// <plate:hills>
// Frutas Prohibidas: CO₂, land and water, each field as tall as its share of a meal's impact.
export const rothkoHills: Paint2D = (ctx, W, H, seed) => {
  const p = rothko(ctx, W, H, 'hills', seed)
  layer('Ground stain'); p.ground()
  layer('Underlayer'); p.underlayer()
  layer('Field 1'); p.field(0)
  layer('Field 2'); p.field(1)
  layer('Field 3'); p.field(2)
  layer('Scumble'); p.scumble()
  layer('Surface'); p.surface()
}
// </plate:hills>

export const PLATES_ROTHKO: { id: ProjectId; slug: string; paint: Paint2D; seed: number }[] = [
  { id: 'frost', slug: 'snapfrost', paint: rothkoFrost, seed: CORE_SEEDS.rothko.frost },
  { id: 'maps', slug: 'los-panaderos', paint: rothkoMaps, seed: CORE_SEEDS.rothko.maps },
  { id: 'iris', slug: 'sybol-compliance-engine', paint: rothkoIris, seed: CORE_SEEDS.rothko.iris },
  { id: 'chain', slug: 'pharmable', paint: rothkoChain, seed: CORE_SEEDS.rothko.chain },
  { id: 'hills', slug: 'frutas-prohibidas', paint: rothkoHills, seed: CORE_SEEDS.rothko.hills },
]
