'use strict';
// paper.js — a sheet of paper as a height field the media interact with, plus a near-flat scanned tone.
// tooth: Float32 0..1 (1 = fibre crest, 0 = pit). Built from three bands of blurred noise (pulp, ~0.12 / 0.5 / 2.5 mm)
// plus thousands of short curved fibres laid along a machine direction. No cellular structure anywhere.
const { rng, clamp, hexToRgb } = require('./util');

const PAPERS = {
  cartridge: { base: [247, 245, 239], depth: 0.55, fibre: 0.55, tone: 2.6 },
  cream:     { base: [240, 231, 208], depth: 0.52, fibre: 0.55, tone: 2.6 },
  hotpress:  { base: [245, 241, 231], depth: 0.26, fibre: 0.40, tone: 1.6, fine: 0.7 },
  grey:      { base: [158, 160, 158], depth: 0.60, fibre: 0.65, tone: 3.4 },
  kraft:     { base: [178, 141, 99],  depth: 0.75, fibre: 0.90, tone: 4.2, flecks: 1 },
  black:     { base: [21, 21, 23],    depth: 0.55, fibre: 0.55, tone: 2.2 },
  navy:      { base: [25, 37, 68],    depth: 0.55, fibre: 0.55, tone: 2.6 },
  teal:      { base: [15, 46, 50],    depth: 0.55, fibre: 0.55, tone: 2.4 },
  graph:     { base: [241, 245, 241], depth: 0.45, fibre: 0.45, tone: 2.0, grid: true },
  vellum:    { base: [231, 235, 235], depth: 0.20, fibre: 0.30, tone: 1.4, fine: 0.6, cloud: 1 },
  animation: { base: [243, 241, 232], depth: 0.42, fibre: 0.45, tone: 2.0, punched: true },
  'toned-warm': { base: [197, 187, 172], depth: 0.60, fibre: 0.65, tone: 3.2 },
};

function boxH(src, dst, W, H, r) {
  const k = 1 / (2 * r + 1);
  for (let y = 0; y < H; y++) {
    const o = y * W; let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[o + Math.min(W - 1, Math.max(0, x))];
    for (let x = 0; x < W; x++) {
      dst[o + x] = acc * k;
      acc += src[o + Math.min(W - 1, x + r + 1)] - src[o + Math.max(0, x - r)];
    }
  }
}
function boxV(src, dst, W, H, r) {
  const k = 1 / (2 * r + 1);
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += src[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y++) {
      dst[y * W + x] = acc * k;
      acc += src[Math.min(H - 1, y + r + 1) * W + x] - src[Math.max(0, y - r) * W + x];
    }
  }
}
function stats(f) {
  const n = f.length; let m = 0; for (let i = 0; i < n; i += 7) m += f[i]; m /= Math.ceil(n / 7);
  let v = 0; for (let i = 0; i < n; i += 7) v += (f[i] - m) * (f[i] - m); v = Math.sqrt(v / Math.ceil(n / 7));
  return [m, v || 1];
}
// smooth value-noise upsampled from a coarse grid (cell px), unit-ish std, added into out * amp
function coarseInto(out, W, H, cell, amp, R) {
  const gw = Math.ceil(W / cell) + 3, gh = Math.ceil(H / cell) + 3;
  const g = new Float32Array(gw * gh); for (let i = 0; i < g.length; i++) g[i] = R() * 2 - 1;
  const inv = 1 / cell;
  for (let y = 0; y < H; y++) {
    const fy = y * inv, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
    for (let x = 0; x < W; x++) {
      const fx = x * inv, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
      const a = g[y0 * gw + x0], b = g[y0 * gw + x0 + 1], c = g[(y0 + 1) * gw + x0], d = g[(y0 + 1) * gw + x0 + 1];
      out[y * W + x] += amp * ((a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy);
    }
  }
}

function resolvePaper(spec) {
  if (typeof spec === 'string') { if (!PAPERS[spec]) throw new Error('unknown paper ' + spec); return { name: spec, ...PAPERS[spec] }; }
  return { name: 'custom', base: hexToRgb(spec.base), depth: spec.tooth ?? 0.5, fibre: spec.fibre ?? 0.5, tone: 2.5 };
}

function buildPaper(S, specIn) {
  const spec = resolvePaper(specIn);
  const { W, H, ppm } = S, N = W * H;
  const R = rng(S.seed + ':paper:' + spec.name);
  const t = new Float32Array(N), tmp = new Float32Array(N);
  // fine tooth: white noise, three box passes ≈ σ 1.4 px, slightly anisotropic (longer along x, the machine direction)
  for (let i = 0; i < N; i++) t[i] = R();
  const fr = spec.fine ? 1 : 1;
  for (let pass = 0; pass < 2; pass++) { boxH(t, tmp, W, H, 1); boxV(tmp, t, W, H, 1); }
  let [m, sd] = stats(t); const kf = 1 / sd; for (let i = 0; i < N; i++) t[i] = (t[i] - m) * kf * (spec.fine ? 0.45 : 0.62);
  // pulp bands
  const cellA = Math.max(3, Math.round(0.5 * ppm)), cellB = Math.max(8, Math.round(2.6 * ppm)), cellC = Math.round(9 * ppm);
  coarseInto(t, W, H, cellA, 0.42 * fr, R);
  coarseInto(t, W, H, cellB, 0.30, R);
  coarseInto(t, W, H, cellC, 0.16, R);
  // fibres
  const area = S.w * S.h, nFib = Math.round(area * 0.75 * spec.fibre * (spec.fine ? 0.5 : 1)), main = R() * 0.5 - 0.25;
  const fibre = (x, y, a, len, da, amp) => {
    const steps = Math.max(2, Math.ceil(len * ppm * 1.4)), dx = 0.7, ca = Math.cos, sa = Math.sin;
    for (let s = 0; s < steps; s++) {
      const q = s / steps, env = Math.sin(Math.PI * q) ** 0.6 * amp;
      const xi = Math.floor(x), yi = Math.floor(y);
      if (xi >= 0 && yi >= 0 && xi < W - 1 && yi < H - 1) {
        const fx = x - xi, fy = y - yi, i = yi * W + xi;
        t[i] += env * (1 - fx) * (1 - fy); t[i + 1] += env * fx * (1 - fy); t[i + W] += env * (1 - fx) * fy; t[i + W + 1] += env * fx * fy;
      }
      x += ca(a) * dx; y += sa(a) * dx; a += da;
    }
  };
  for (let k = 0; k < nFib; k++) {
    const raised = R() < 0.62;
    const len = Math.exp(R.gauss(Math.log(1.6), 0.55));
    const a = main + R.gauss(0, 0.75) + (R() < 0.15 ? (R() - 0.5) * 3 : 0);
    fibre(R() * W, R() * H, a, Math.min(9, len), R.gauss(0, 0.05), (raised ? 1 : -0.8) * (0.55 + R() * 0.6));
  }
  // a few long dark channels / creases in the sheet: very shallow
  const nCh = Math.round(area / 9000 * spec.fibre);
  for (let k = 0; k < nCh; k++) fibre(R() * W, R() * H, main + R.gauss(0, 0.4), 6 + R() * 12, R.gauss(0, 0.012), -0.5 * (0.5 + R()));
  [m, sd] = stats(t);
  const kk = 0.21 / sd; // std 0.21 around 0.5
  for (let i = 0; i < N; i++) { const v = 0.5 + (t[i] - m) * kk; t[i] = v < 0 ? 0 : v > 1 ? 1 : v; }

  // ---- tone (near flat): base + pulp mottle + tooth catching the light a hair
  const rgb = new Float32Array(N * 3);
  const mot = new Float32Array(N);
  coarseInto(mot, W, H, Math.round(45 * ppm), 0.55, R); coarseInto(mot, W, H, Math.round(11 * ppm), 0.5, R);
  const lum = (spec.base[0] * 0.3 + spec.base[1] * 0.59 + spec.base[2] * 0.11) / 255;
  const tscale = spec.tone * (0.55 + 0.45 * lum);
  const mscale = (spec.mottle ?? 1.0) * (0.5 + 0.9 * lum);
  for (let i = 0; i < N; i++) {
    const d = (t[i] - 0.5) * tscale + mot[i] * mscale;
    rgb[3 * i] = spec.base[0] + d; rgb[3 * i + 1] = spec.base[1] + d * 0.97; rgb[3 * i + 2] = spec.base[2] + d * 0.92;
  }
  S.tooth = t; S.rgb = rgb; S.depth = spec.depth; S.paperSpec = spec;

  // ---- paper-specific extras
  if (spec.flecks) { // kraft: dark and pale pulp flecks
    const nf = Math.round(area * 0.05);
    for (let k = 0; k < nf; k++) {
      const dark = R() < 0.6, col = dark ? [98, 68, 42] : [214, 184, 146], a0 = R() * 6.28, len = 0.8 + R() * 2.6, alpha = dark ? 0.10 + R() * 0.14 : 0.12 + R() * 0.16;
      let x = R() * W, y = R() * H, a = a0; const steps = Math.ceil(len * ppm);
      for (let s = 0; s < steps; s++) {
        const xi = x | 0, yi = y | 0;
        if (xi > 0 && yi > 0 && xi < W - 1 && yi < H - 1) for (let dy = 0; dy <= (R() < 0.6 ? 1 : 0); dy++) { const j = 3 * ((yi + dy) * W + xi); for (let c = 0; c < 3; c++) rgb[j + c] += (col[c] - rgb[j + c]) * alpha; }
        x += Math.cos(a) * 0.8; y += Math.sin(a) * 0.8; a += R.gauss(0, 0.06);
      }
    }
  }
  if (spec.cloud) { // vellum: faint cloudiness
    const cl = new Float32Array(N); coarseInto(cl, W, H, Math.round(6 * ppm), 1.0, R); coarseInto(cl, W, H, Math.round(20 * ppm), 1.0, R);
    for (let i = 0; i < N; i++) { const d = cl[i] * 1.3; rgb[3 * i] += d * 0.9; rgb[3 * i + 1] += d; rgb[3 * i + 2] += d * 1.1; }
  }
  if (spec.grid) printGrid(S, rgb, t, R);
  S.paper0 = new Uint8ClampedArray(N * 3); for (let i = 0; i < N * 3; i++) S.paper0[i] = rgb[i];
  if (spec.punched) punch(S, rgb, t, R);
  return spec;
}

// printed graph grid: 1 mm hairline, 5 mm medium, 10 mm heavier; machine-perfect, but the ink breaks up on the tooth
function printGrid(S, rgb, t, R) {
  const { W, H, ppm } = S;
  const ink = [128, 178, 176];
  const band = (px, horizontal, width, dens) => {
    const p0 = Math.floor(px - width / 2 - 1), p1 = Math.ceil(px + width / 2 + 1);
    for (let p = p0; p <= p1; p++) {
      const cov = Math.max(0, Math.min(1, width / 2 + 0.5 - Math.abs(p + 0.5 - px)));
      if (cov <= 0) continue;
      const lim = horizontal ? H : W, len = horizontal ? W : H;
      if (p < 0 || p >= lim) continue;
      for (let q = 0; q < len; q++) {
        const i = horizontal ? p * W + q : q * W + p;
        const a = cov * dens * (0.55 + 0.9 * t[i]);
        const j = 3 * i; rgb[j] += (ink[0] - rgb[j]) * a; rgb[j + 1] += (ink[1] - rgb[j + 1]) * a; rgb[j + 2] += (ink[2] - rgb[j + 2]) * a;
      }
    }
  };
  const ox = ((S.w % 5) / 2), oy = ((S.h % 5) / 2); // printed grid does not start exactly at the trim
  for (let mm = 0, k = 0; mm * ppm < W; mm += 1, k++) { const x = (mm + ox) * ppm; band(x, false, k % 5 === 0 ? 0.24 * ppm : 0.11 * ppm, k % 5 === 0 ? 0.55 : 0.26); }
  for (let mm = 0, k = 0; mm * ppm < H; mm += 1, k++) { const y = (mm + oy) * ppm; band(y, true, k % 5 === 0 ? 0.24 * ppm : 0.11 * ppm, k % 5 === 0 ? 0.55 : 0.26); }
}

// animation paper: three punched holes (round centre, two oblong) on the bottom edge, and printed registration marks
function punch(S, rgb, t, R) {
  const { W, H, ppm } = S;
  const cy = (S.h - 15) * ppm, cx = S.w / 2 * ppm, off = 88.9 * ppm;
  const holes = [[cx, cy, 5.2 * ppm, 5.2 * ppm], [cx - off, cy, 8.2 * ppm, 3.6 * ppm], [cx + off, cy, 8.2 * ppm, 3.6 * ppm]];
  const lid = [58, 58, 60];
  for (const [hx, hy, rx, ry] of holes) {
    for (let y = Math.floor(hy - ry - 3); y <= Math.ceil(hy + ry + 3); y++) for (let x = Math.floor(hx - rx - 3); x <= Math.ceil(hx + rx + 3); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      // stadium: slot along x, semi-axes rx (long) ry (short); round hole when rx == ry
      const ex = Math.max(0, Math.abs(x + 0.5 - hx) - (rx - ry)), ey = y + 0.5 - hy, d = Math.hypot(ex, ey) - ry;
      const i = 3 * (y * W + x);
      if (d < 0.5) { const a = Math.min(1, 0.5 - d); rgb[i] += (lid[0] - rgb[i]) * a; rgb[i + 1] += (lid[1] - rgb[i + 1]) * a; rgb[i + 2] += (lid[2] - rgb[i + 2]) * a; }
      else if (d < 0.32 * ppm) { const a = 0.12 * (1 - d / (0.32 * ppm)); rgb[i] -= rgb[i] * a; rgb[i + 1] -= rgb[i + 1] * a; rgb[i + 2] -= rgb[i + 2] * a; } // a hair of crushed rim
    }
  }
  // registration marks: pale grey-blue printed crosses / a ruled bar above the holes
  const ink = [170, 176, 180];
  const line = (x0, y0, x1, y1, wpx, dens) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5);
    for (let k = 0; k <= n; k++) {
      const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const px = Math.floor(x) + dx, py = Math.floor(y) + dy; if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const cov = Math.max(0, Math.min(1, wpx / 2 + 0.5 - Math.hypot(px + 0.5 - x, py + 0.5 - y)));
        if (cov <= 0) continue; const i = py * W + px, a = cov * dens * (0.6 + 0.8 * t[i]), j = 3 * i;
        rgb[j] += (ink[0] - rgb[j]) * a; rgb[j + 1] += (ink[1] - rgb[j + 1]) * a; rgb[j + 2] += (ink[2] - rgb[j + 2]) * a;
      }
    }
  };
  const bar = (S.h - 27) * ppm;
  line(cx - off - 20 * ppm, bar, cx + off + 20 * ppm, bar, 0.18 * ppm, 0.7);
  for (const hx of [cx - off, cx, cx + off]) { line(hx, bar - 3 * ppm, hx, bar + 3 * ppm, 0.18 * ppm, 0.7); }
  line(cx - 12 * ppm, bar - 14 * ppm, cx + 12 * ppm, bar - 14 * ppm, 0.18 * ppm, 0.6);
  line(cx, bar - 20 * ppm, cx, bar - 8 * ppm, 0.18 * ppm, 0.6);
}

module.exports = { buildPaper, PAPERS };
