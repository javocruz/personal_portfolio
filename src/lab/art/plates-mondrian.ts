/**
 * Core, Mondrian style (hidden for now, see SHOW_CORE_STYLE_SWITCH): the plate wrappers over mondrian.ts. All three
 * levels are baked; the site would use LEVEL (2, Dense). Seeds per level live in content/art.ts (CORE_SEEDS).
 */
import { layer } from './layers'
import { mondrian, LEVEL, type Level } from './mondrian'
import type { ProjectId } from './rothko'
import { CORE_SEEDS } from '../../content/art'

export type PaintMondrian = (ctx: CanvasRenderingContext2D, W: number, H: number, seed: number, level?: Level) => void

// <plate:frost>
// SnapFrost: blue night, one long yellow strip for the 0.21 °C gained, a small red counterweight.
export const mondrianFrost: PaintMondrian = (ctx, W, H, seed, level = LEVEL) => {
  const p = mondrian(ctx, W, H, 'frost', seed, level)
  layer('Ground'); p.ground()
  layer('Planes'); p.planes()
  layer('Pentimenti'); p.pentimenti()
  layer('Lines'); p.lines()
  layer('Crossings'); p.crossings()
  layer('Surface'); p.surface()
}
// </plate:frost>

// <plate:maps>
// Los Panaderos: red fire, and a small red echo that never touches it, 12 steps behind.
export const mondrianMaps: PaintMondrian = (ctx, W, H, seed, level = LEVEL) => {
  const p = mondrian(ctx, W, H, 'maps', seed, level)
  layer('Ground'); p.ground()
  layer('Planes'); p.planes()
  layer('Pentimenti'); p.pentimenti()
  layer('Lines'); p.lines()
  layer('Crossings'); p.crossings()
  layer('Surface'); p.surface()
}
// </plate:maps>

// <plate:iris>
// Sybol: order on the left in blue, doubt on the right in red.
export const mondrianIris: PaintMondrian = (ctx, W, H, seed, level = LEVEL) => {
  const p = mondrian(ctx, W, H, 'iris', seed, level)
  layer('Ground'); p.ground()
  layer('Planes'); p.planes()
  layer('Pentimenti'); p.pentimenti()
  layer('Lines'); p.lines()
  layer('Crossings'); p.crossings()
  layer('Surface'); p.surface()
}
// </plate:iris>

// <plate:chain>
// Pharmable: seven main planes, one red. Everything else in the chain is clean.
export const mondrianChain: PaintMondrian = (ctx, W, H, seed, level = LEVEL) => {
  const p = mondrian(ctx, W, H, 'chain', seed, level)
  layer('Ground'); p.ground()
  layer('Planes'); p.planes()
  layer('Pentimenti'); p.pentimenti()
  layer('Lines'); p.lines()
  layer('Crossings'); p.crossings()
  layer('Surface'); p.surface()
}
// </plate:chain>

// <plate:hills>
// Frutas Prohibidas: red CO₂, yellow land, blue water, sized by their shares.
export const mondrianHills: PaintMondrian = (ctx, W, H, seed, level = LEVEL) => {
  const p = mondrian(ctx, W, H, 'hills', seed, level)
  layer('Ground'); p.ground()
  layer('Planes'); p.planes()
  layer('Pentimenti'); p.pentimenti()
  layer('Lines'); p.lines()
  layer('Crossings'); p.crossings()
  layer('Surface'); p.surface()
}
// </plate:hills>

export const PLATES_MONDRIAN: { id: ProjectId; slug: string; paint: PaintMondrian; seeds: Record<Level, number> }[] = [
  { id: 'frost', slug: 'snapfrost', paint: mondrianFrost, seeds: { 1: CORE_SEEDS.mondrian.level1.frost, 2: CORE_SEEDS.mondrian.level2.frost, 3: CORE_SEEDS.mondrian.level3.frost } },
  { id: 'maps', slug: 'los-panaderos', paint: mondrianMaps, seeds: { 1: CORE_SEEDS.mondrian.level1.maps, 2: CORE_SEEDS.mondrian.level2.maps, 3: CORE_SEEDS.mondrian.level3.maps } },
  { id: 'iris', slug: 'sybol-compliance-engine', paint: mondrianIris, seeds: { 1: CORE_SEEDS.mondrian.level1.iris, 2: CORE_SEEDS.mondrian.level2.iris, 3: CORE_SEEDS.mondrian.level3.iris } },
  { id: 'chain', slug: 'pharmable', paint: mondrianChain, seeds: { 1: CORE_SEEDS.mondrian.level1.chain, 2: CORE_SEEDS.mondrian.level2.chain, 3: CORE_SEEDS.mondrian.level3.chain } },
  { id: 'hills', slug: 'frutas-prohibidas', paint: mondrianHills, seeds: { 1: CORE_SEEDS.mondrian.level1.hills, 2: CORE_SEEDS.mondrian.level2.hills, 3: CORE_SEEDS.mondrian.level3.hills } },
]
