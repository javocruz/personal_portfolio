// Loaded lazily (see components/Scene.tsx) so the shaders library stays out of the first paint.
import { Shader, FlowingGradient, FilmGrain, Aurora, Vignette, ChromaFlow, MeshGradient, Dither, Glitch } from 'shaders/react'

export type SceneName = 'hero' | 'hyper' | 'contact' | 'fire' | 'shield' | 'pharma' | 'stream' | 'aero' | 'fruit'

export default function Scene({ name }: { name: SceneName }) {
  switch (name) {
    case 'hero':
      return (
        <Shader className="shader-canvas">
          <FlowingGradient colorA="#0a0908" colorB="#7a1f08" colorC="#ff5b2e" colorD="#2b1a4d" speed={0.6} distortion={0.8} />
          <ChromaFlow baseColor="#00000000" intensity={0.6} radius={2} />
          <FilmGrain strength={0.3} />
          <Vignette intensity={0.7} radius={0.9} />
        </Shader>
      )
    case 'hyper':
      return (
        <Shader className="shader-canvas">
          <FlowingGradient colorA="#02010a" colorB="#1b2cff" colorC="#ff2bd6" colorD="#00ffd0" speed={3} distortion={1.4} />
          <Glitch intensity={0.55} rgbShift={8} />
          <Dither pattern="bayer4" pixelSize={2} colorB="#ffffff" threshold={0.6} spread={0.35} />
          <Vignette intensity={0.8} radius={0.9} />
        </Shader>
      )
    case 'contact':
      return (
        <Shader className="shader-canvas">
          <FlowingGradient colorA="#0a0908" colorB="#ff5b2e" colorC="#7a1f08" colorD="#0a0908" speed={0.5} />
          <FilmGrain strength={0.35} />
        </Shader>
      )
    case 'fire':
      return (
        <Shader className="shader-canvas">
          <MeshGradient stops={[{ color: '#120402', position: 0 }, { color: '#9c1d08', position: 0.4 }, { color: '#ff5b2e', position: 0.72 }, { color: '#ffd37a', position: 1 }]} />
          <Dither pattern="bayer4" pixelSize={3} colorB="#ffe3b0" threshold={0.6} spread={0.45} />
        </Shader>
      )
    case 'shield':
      return (
        <Shader className="shader-canvas">
          <MeshGradient stops={[{ color: '#030a1a', position: 0 }, { color: '#0b3a7a', position: 0.4 }, { color: '#18a6c9', position: 0.72 }, { color: '#b8f3ff', position: 1 }]} />
          <FilmGrain strength={0.3} />
        </Shader>
      )
    case 'pharma':
      return (
        <Shader className="shader-canvas">
          <FlowingGradient colorA="#04140f" colorB="#0f6b4f" colorC="#7dffc4" colorD="#12315a" speed={0.7} distortion={0.6} />
          <FilmGrain strength={0.3} />
        </Shader>
      )
    case 'stream':
      return (
        <Shader className="shader-canvas">
          <FlowingGradient colorA="#0b0420" colorB="#6b17e6" colorC="#ff4dc4" colorD="#2b1a4d" speed={1.2} distortion={0.9} />
          <Glitch intensity={0.2} rgbShift={4} />
        </Shader>
      )
    case 'aero':
      return (
        <Shader className="shader-canvas">
          <Aurora colorA="#0a3b5c" colorB="#7dffc4" colorC="#3b6bff" intensity={85} />
          <FilmGrain strength={0.3} />
        </Shader>
      )
    case 'fruit':
    default:
      return (
        <Shader className="shader-canvas">
          <MeshGradient stops={[{ color: '#1a0603', position: 0 }, { color: '#c7260f', position: 0.4 }, { color: '#ff5b2e', position: 0.7 }, { color: '#ffd9a0', position: 1 }]} />
          <Dither pattern="bayer4" pixelSize={3} colorB="#ffe9c9" threshold={0.55} spread={0.5} />
        </Shader>
      )
  }
}
