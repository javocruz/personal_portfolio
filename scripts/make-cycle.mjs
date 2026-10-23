/**
 * Bakes the Course of Empire paintings for Complete's home: crops each original in art-src/ to 16:9 around its focal
 * point (from src/content/cycle.ts) and writes AVIF + WebP + JPG at 960 and 1920 wide to public/art/cycle/.
 * Missing originals are downloaded from Wikimedia Commons first (sources in CREDITS.md).
 *
 *   npm run make-cycle
 */
import { existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { stages, crop } from '../src/content/cycle.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'art-src')
const OUT = join(root, 'public/art/cycle')

// public domain scans on Wikimedia Commons (same source set, so colour and grain match across the five)
const COMMONS = {
  savage: 'Cole_Thomas_The_Course_of_Empire_The_Savage_State_1836.jpg',
  arcadian: 'Cole_Thomas_The_Course_of_Empire_The_Arcadian_or_Pastoral_State_1836.jpg',
  consummation: 'Cole_Thomas_The_Consummation_The_Course_of_the_Empire_1836.jpg',
  destruction: 'Cole_Thomas_The_Course_of_Empire_Destruction_1836.jpg',
  desolation: 'Cole_Thomas_The_Course_of_Empire_Desolation_1836.jpg',
}

async function original(id) {
  const file = join(SRC, `cole-${id}.jpg`)
  if (existsSync(file)) return file
  mkdirSync(SRC, { recursive: true })
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${COMMONS[id]}`
  console.log(`downloading ${id} from ${url}`)
  const res = await fetch(url, { headers: { 'User-Agent': 'javicruz-portfolio/1.0 (contact@javicruz.dev)' } })
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`)
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  return file
}

mkdirSync(OUT, { recursive: true })
for (const s of stages.filter((s) => COMMONS[s.id])) {
  const file = await original(s.id)
  const { width, height } = await sharp(file).metadata()
  const c = crop(s)
  const region = { left: Math.round(c.x * width), top: Math.round(c.y * height), width: Math.round(c.w * width), height: Math.round(c.h * height) }
  for (const w of [960, 1920]) {
    // a touch of sharpening after the big downscale keeps Cole's small figures crisp
    const base = sharp(file).extract(region).resize(w, Math.round((w * 9) / 16), { kernel: 'lanczos3' }).sharpen({ sigma: 0.5 })
    const name = join(OUT, `${s.id}-${w}`)
    await base.clone().avif({ quality: w > 960 ? 64 : 60, effort: 7, chromaSubsampling: '4:2:0' }).toFile(`${name}.avif`)
    await base.clone().webp({ quality: 74, effort: 6 }).toFile(`${name}.webp`)
    await base.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${name}.jpg`)
    const kb = (ext) => Math.round(statSync(`${name}.${ext}`).size / 1024)
    console.log(`${s.id}-${w}: avif ${kb('avif')}KB · webp ${kb('webp')}KB · jpg ${kb('jpg')}KB`)
  }
}
