#version 300 es
// The Course of Empire dissolve: painting A breaks into 1-bit dots, the dots switch to painting B's image and colours,
// then resolve into B. Everything is per dot (a grid of uDot device pixels) except the two full paintings and the glow.
precision highp float;
precision highp int;

uniform sampler2D uA, uB;
uniform vec2 uRes;          // canvas size, device px
uniform float uT;           // dissolve progress A -> B, 0..1
uniform float uDot;         // dot size, device px
uniform float uAspA, uAspB; // texture aspects (w/h)
uniform vec2 uFocA, uFocB;  // focal point in each texture, 0..1, y down
uniform float uHasA, uHasB; // 0 = that side is plain black (the void before the contact section)
uniform int uEnter;         // how B arrives: 0 rise, 1 sweep-right, 2 centre, 3 from-fire, 4 fall, 5 close-in
uniform vec3 uHiA, uLoA, uHiB, uLoB, uGlow;
uniform vec2 uMouse;        // device px, y down
uniform float uLens;        // 0..1, how present the cursor lens is
uniform float uLensR;       // device px
uniform float uLensPh;      // the phase the lens pulls towards
uniform vec2 uShift;        // Bayer offset in dots (the shimmer)
uniform float uGlowAmt;     // edge glow strength
uniform float uSeed;        // grain frame

out vec4 outColor;

// 8x8 Bayer threshold, 0..1, from the bit-reversed interleave of (x^y, y)
float bayer8(ivec2 p) {
  int x = p.x & 7, y = p.y & 7, xc = x ^ y;
  int v = ((xc & 1) << 5) | ((y & 1) << 4) | ((xc & 2) << 2) | ((y & 2) << 1) | ((xc & 4) >> 1) | ((y & 4) >> 2);
  return (float(v) + 0.5) / 64.0;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
// low-frequency, about 7 cells across, plus one finer octave so the front is ragged rather than blobby
float field(vec2 s, float aspect) {
  vec2 p = vec2(s.x, s.y / aspect) * 7.0;
  return (vnoise(p) * 0.72 + vnoise(p * 2.7 + 13.1) * 0.28);
}

// object-fit: cover, biased towards the focal point (matches the hero <img> when the focus is the centre)
vec2 cover(vec2 s, float ta, vec2 f) {
  float va = uRes.x / uRes.y;
  if (va > ta) { float h = ta / va; return vec2(s.x, clamp(f.y - h * 0.5, 0.0, 1.0 - h) + s.y * h); }
  float w = va / ta;
  return vec2(clamp(f.x - w * 0.5, 0.0, 1.0 - w) + s.x * w, s.y);
}
// where a texture point lands on screen under cover()
vec2 onScreen(vec2 t, float ta, vec2 f) {
  float va = uRes.x / uRes.y;
  if (va > ta) { float h = ta / va; float y0 = clamp(f.y - h * 0.5, 0.0, 1.0 - h); return vec2(t.x, (t.y - y0) / h); }
  float w = va / ta; float x0 = clamp(f.x - w * 0.5, 0.0, 1.0 - w);
  return vec2((t.x - x0) / w, t.y);
}

// the front: 0 = goes first, 1 = goes last
float front(vec2 s) {
  float va = uRes.x / uRes.y, n = field(s, va);
  if (uEnter == 0) return 0.55 * (1.0 - s.y) + 0.45 * n;
  if (uEnter == 1) return 0.6 * s.x + 0.4 * n;
  if (uEnter == 4) return 0.55 * s.y + 0.45 * n;
  if (uEnter == 5) { float e = min(min(s.x, 1.0 - s.x), min(s.y, 1.0 - s.y)) * 2.0; return 0.6 * e + 0.4 * n; }
  // centre / from-fire: out from B's focal point
  vec2 o = onScreen(uFocB, uAspB, uFocB);
  float d = length((s - o) * vec2(va, 1.0)) / length(vec2(max(o.x, 1.0 - o.x) * va, max(o.y, 1.0 - o.y)));
  return uEnter == 3 ? 0.62 * d + 0.38 * n : 0.55 * d + 0.45 * n;
}

float phase(vec2 s, vec2 px) {
  float ph = clamp(uT * 1.5 - front(s) * 0.5, 0.0, 1.0);
  float w = uLens * (1.0 - smoothstep(uLensR * 0.45, uLensR, length(px - uMouse)));
  return mix(ph, uLensPh, w);
}

vec3 paint(sampler2D tex, float has, vec2 s, float ta, vec2 f) { return has * texture(tex, cover(s, ta, f)).rgb; }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); // device px, y down
  vec2 s = px / uRes;

  // snap to the dot grid; the dither decisions are made once per dot, at its centre
  vec2 cell = floor(px / uDot);
  vec2 cpx = (cell + 0.5) * uDot;
  vec2 cs = cpx / uRes;
  float ph = phase(cs, cpx);
  float b = bayer8(ivec2(cell + uShift));

  vec3 col;
  if (b >= ph / 0.33) {
    col = paint(uA, uHasA, s, uAspA, uFocA);
  } else if ((ph - 0.66) / 0.34 > b) {
    col = paint(uB, uHasB, s, uAspB, uFocB);
  } else {
    bool toB = b < (ph - 0.33) / 0.33;
    float l = toB ? luma(paint(uB, uHasB, cs, uAspB, uFocB)) : luma(paint(uA, uHasA, cs, uAspA, uFocA));
    bool hi = l * 1.15 > b;
    col = toB ? (hi ? uHiB : uLoB) : (hi ? uHiA : uLoA);
    // the leading edge burns: in the 0.1..0.2 band the bright dots take the target's glow colour, and any dot that
    // has only just flipped flares for a moment, so the heat rides the front instead of washing over a region
    float edge = smoothstep(0.08, 0.12, ph) * (1.0 - smoothstep(0.18, 0.22, ph));
    float fresh = 1.0 - smoothstep(0.0, 0.1, ph / 0.33 - b);
    float heat = max(hi ? edge : 0.0, fresh * 0.9) * min(1.0, uGlowAmt);
    col = mix(col, uGlow * 1.25, heat);
  }

  // bloom: a faint halo on the same band, per pixel (not per dot) so it reads as light rather than dots
  float pph = phase(s, px);
  float halo = smoothstep(0.08, 0.13, pph) * (1.0 - smoothstep(0.17, 0.22, pph));
  col += uGlow * halo * 0.14 * uGlowAmt;

  // very faint grain
  col += (hash(px + uSeed * 17.0) - 0.5) * 0.028;
  outColor = vec4(col, 1.0);
}
