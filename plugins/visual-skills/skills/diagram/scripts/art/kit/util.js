'use strict';
// util.js — small numeric helpers shared by kit-a.
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

function hashStr(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}
// mulberry32 with the helper methods the contract wants
function rng(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : hashStr(String(seed));
  const R = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = 0; i < 8; i++) R();
  R.range = (lo, hi) => lo + R() * (hi - lo);
  R.int = (lo, hi) => Math.floor(lo + R() * (hi - lo + 1));
  R.pick = (arr) => arr[Math.floor(R() * arr.length)];
  R.chance = (p) => R() < p;
  R.gauss = (m = 0, sd = 1) => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  R.shuffle = (arr) => { const o = arr.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
  R.fork = (tag) => rng(hashStr(String(tag)) ^ Math.floor(R() * 4294967296));
  return R;
}

// band-limited 1-D wander: a handful of incommensurate sinusoids. f(s) in about [-1,1].
function wander(R, lamMin, lamMax, n = 4) {
  const A = [], L = [], P = [];
  let norm = 0;
  for (let i = 0; i < n; i++) {
    const lam = lamMin * Math.pow(lamMax / lamMin, (i + R() * 0.8) / n);
    const amp = Math.pow(lam / lamMax, 0.35) * (0.6 + 0.8 * R());
    A.push(amp); L.push(TAU / lam); P.push(R() * TAU); norm += amp * amp;
  }
  norm = 1 / Math.sqrt(norm / 2 * 1.0);
  return (s) => { let v = 0; for (let i = 0; i < n; i++) v += A[i] * Math.sin(s * L[i] + P[i]); return v * norm * 0.5; };
}

function hexToRgb(h) {
  if (Array.isArray(h)) return h;
  h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// centripetal-ish Catmull-Rom through pts (mm), sampled roughly every `step`
function catmull(pts, step) {
  const n = pts.length;
  if (n === 1) return [pts[0].slice()];
  if (n === 2) {
    const d = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), m = Math.max(2, Math.ceil(d / step));
    const o = []; for (let i = 0; i <= m; i++) { const t = i / m; o.push([pts[0][0] + (pts[1][0] - pts[0][0]) * t, pts[0][1] + (pts[1][1] - pts[0][1]) * t]); }
    return o;
  }
  const P = [pts[0].map((v, i) => 2 * v - pts[1][i]), ...pts, pts[n - 1].map((v, i) => 2 * v - pts[n - 2][i])];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const seg = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), m = Math.max(1, Math.ceil(seg / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(pts[n - 1].slice());
  return out;
}

module.exports = { TAU, clamp, lerp, smooth, hashStr, rng, wander, hexToRgb, catmull };
