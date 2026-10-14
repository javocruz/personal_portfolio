import { Shader, ImageTexture, Engraving, Tritone, Dither, Halftone, Duotone, FilmGrain, Vignette, WaveDistortion, BrightnessContrast, Invert, Paper } from 'shaders/react'

/**
 * Böcklin's Isle of the Dead (Berlin, third version, public domain) run through live WebGPU treatments.
 * Effects wrap the image (they are nested, not siblings), and the painting is brightened first because it is very dark.
 */
export type IsleMode = 'engraved-gold' | 'engraved-paper' | 'dusk' | 'dither-blue' | 'halftone' | 'raw'

const IMG = '/lab/isle.jpg'
const Lit = ({ b = 0.22, c = 0.18, children }: { b?: number; c?: number; children: React.ReactNode }) => (
  <BrightnessContrast brightness={b} contrast={c}>{children}</BrightnessContrast>
)
const Img = () => <ImageTexture url={IMG} objectFit="cover" />

export function IsleScene({ mode, className = 'shader-canvas' }: { mode: IsleMode; className?: string }) {
  switch (mode) {
    case 'engraved-gold': // gold line-work on black: invert so the lights carry the ink
      return (
        <Shader className={className}>
          <Vignette intensity={0.85} radius={0.9}>
            <FilmGrain strength={0.3}>
              <Engraving style="spiral" center={{ x: 0.5, y: 0.3 }} frequency={120} relief={0.95} waviness={0.3} contrast={1.35} inkColor="#f0b955" paperColor="#050408">
                <Invert><Lit b={0.1} c={0.25}><Img /></Lit></Invert>
              </Engraving>
            </FilmGrain>
          </Vignette>
        </Shader>
      )
    case 'engraved-paper': // classic ink on cream paper
      return (
        <Shader className={className}>
          <FilmGrain strength={0.18}>
            <Paper roughness={0.3}>
              <Engraving style="crosshatch" frequency={170} angle={10} relief={0.8} waviness={0.4} contrast={1.1} inkColor="#17110c" paperColor="#efe6d4">
                <Lit b={0.3} c={0.15}><Img /></Lit>
              </Engraving>
            </Paper>
          </FilmGrain>
        </Shader>
      )
    case 'dusk': // painterly: ink-blue shadows to gold lights, shimmering water
      return (
        <Shader className={className}>
          <Vignette intensity={0.75} radius={0.95}>
            <FilmGrain strength={0.35}>
              <Tritone colorA="#05060f" colorB="#31479a" colorC="#f4c870" blendMid={0.5}>
                <Lit b={0.32} c={0.22}><WaveDistortion strength={0.004} frequency={9} speed={0.5} angle={90}><Img /></WaveDistortion></Lit>
              </Tritone>
            </FilmGrain>
          </Vignette>
        </Shader>
      )
    case 'dither-blue': // 1-bit blue dither, Shubhu-style
      return (
        <Shader className={className}>
          <Dither pattern="bayer4" pixelSize={3} colorA="#050a2a" colorB="#6f8cff" threshold={0.5} spread={0.9}>
            <Lit b={0.3} c={0.2}><Img /></Lit>
          </Dither>
        </Shader>
      )
    case 'halftone':
      return (
        <Shader className={className}>
          <Halftone frequency={110} angle={30}>
            <Duotone colorA="#08080d" colorB="#ff6a2e" blend={0.9}><Lit b={0.25}><Img /></Lit></Duotone>
          </Halftone>
        </Shader>
      )
    default:
      return (
        <Shader className={className}>
          <Vignette intensity={0.6} radius={0.9}><Lit><Img /></Lit></Vignette>
        </Shader>
      )
  }
}
