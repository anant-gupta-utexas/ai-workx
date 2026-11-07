'use strict';
// hand.js — turns "the points a hand aimed at" into what the hand actually did with the tool:
// a damped-spring follower (lag, rounded corners, end overshoot), band-limited wander (bow and tremor),
// a pressure profile with slow drift, radius and ink-flow along the way (skips, blobs, dropouts).
const { catmull, wander, clamp, smooth } = require('./util');

function resampleMM(pts, ds) {
  if (pts.length < 2) return pts;
  const out = [pts[0].slice()]; let need = ds;
  for (let i = 1; i < pts.length; i++) {
    let x0 = pts[i - 1][0], y0 = pts[i - 1][1]; const x1 = pts[i][0], y1 = pts[i][1]; let d = Math.hypot(x1 - x0, y1 - y0);
    while (d >= need && d > 0) { const t = need / d; x0 += (x1 - x0) * t; y0 += (y1 - y0) * t; out.push([x0, y0]); d = Math.hypot(x1 - x0, y1 - y0); need = ds; }
    need -= d;
  }
  const l = pts[pts.length - 1], e = out[out.length - 1];
  if (Math.hypot(l[0] - e[0], l[1] - e[1]) > ds * 0.3) out.push(l.slice());
  return out;
}

function follow(tgt, L, ds, zeta) {
  const m = tgt.length; if (m < 3 || L <= 0) return tgt;
  const w = Math.min(0.5, ds / L), k = w * w, c = 2 * zeta * w, lag = Math.max(0, Math.round(2 * zeta / w));
  let x = tgt[0][0], y = tgt[0][1];
  let vx = (tgt[1][0] - tgt[0][0]), vy = (tgt[1][1] - tgt[0][1]);
  const out = [[x, y]]; const total = m - 1 + lag + Math.round(0.35 / w);
  for (let i = 1; i <= total; i++) {
    const tar = tgt[Math.min(m - 1, i + lag - 1 > m - 1 ? m - 1 : i + lag - 1)];
    vx += k * (tar[0] - x) - c * vx; vy += k * (tar[1] - y) - c * vy;
    x += vx; y += vy; out.push([x, y]);
  }
  return out;
}

function ramp(x, len) { return len <= 0 ? 1 : smooth(0, len, x); }

function profileAt(kind, sMm, Lmm, nt0, nt1) {
  switch (kind) {
    case 'taper': { const a = Math.min(4, 0.3 * Lmm), b = Math.min(8, 0.5 * Lmm); return 0.12 + 0.88 * Math.min(ramp(sMm, a), ramp(Lmm - sMm, b)); }
    case 'hatch': { const a = nt0 ? 0 : Math.min(2, 0.25 * Lmm), b = nt1 ? 0 : Math.min(5, 0.4 * Lmm); return 0.24 + 0.76 * Math.min(ramp(sMm, a), ramp(Lmm - sMm, b)); }
    case 'swell': { const q = sMm / Lmm; return 0.25 + 0.75 * Math.sin(Math.PI * q) ** 0.7; }
    case 'flick': { const b = Lmm * 0.9; return 0.06 + 0.94 * Math.min(ramp(sMm, 0.4), ramp(Lmm - sMm, b)); }
    case 'rise': { const a = Lmm * 0.85; return 0.15 + 0.85 * Math.min(ramp(sMm, a), ramp(Lmm - sMm, 0.4)); }
    default: return 0.55 + 0.45 * Math.min(ramp(sMm, 0.5), ramp(Lmm - sMm, 0.6));
  }
}

const SPEED = { slow: { p: 1.06, drop: 0.25, trem: 1.25 }, normal: { p: 1, drop: 1, trem: 1 }, fast: { p: 0.86, drop: 4.2, trem: 0.8 } };

function buildPath(S, T, pts, o = {}) {
  const M = T.med, R = S.R, ppm = S.ppm;
  const sp = SPEED[o.speed || 'normal'];
  const smoothL = o.smooth ?? M.smooth;
  const ds = Math.max(0.05, Math.min(0.25, smoothL / 5));
  let tgt = pts.length === 1 ? [pts[0].slice(), [pts[0][0] + 0.01, pts[0][1]]] : resampleMM(catmull(pts, ds), ds);
  if (tgt.length < 2) tgt = [tgt[0], [tgt[0][0] + 0.02, tgt[0][1]]];
  if (o.exact !== true) tgt = follow(tgt, smoothL, ds, 0.72);
  // arc length (mm)
  const m0 = tgt.length, cum = new Float32Array(m0); for (let i = 1; i < m0; i++) cum[i] = cum[i - 1] + Math.hypot(tgt[i][0] - tgt[i - 1][0], tgt[i][1] - tgt[i - 1][1]);
  const Lmm = cum[m0 - 1] || 0.001;
  // wander offsets: bow (low frequency) + tremor (mid/high)
  const trem = (o.tremor ?? 1) * M.tremor * sp.trem * (T.tremorMul || 1);
  const wBow = wander(R, Math.max(6, Lmm * 0.9), Math.max(20, Lmm * 3.5), 2), wMid = wander(R, 2.5, 14, 3), wHi = wander(R, 0.5, 2.6, 3);
  const bowAmp = Math.min(1.6, Lmm * 0.0042) * trem * (o.bow ?? 1), midAmp = 0.07 * trem, hiAmp = 0.02 * trem;
  const nodes = [];
  // nodes at px spacing
  const rmeanPx = M.r0 * ppm;
  const stepPx = M.mode === 'stamp' ? 1.0 : clamp(0.7 * rmeanPx, 1.1, 4.5);
  const stepMm = stepPx / ppm;
  let ni = 1, sMm = 0;
  const pos = (i, j, u) => [tgt[i][0] + (tgt[j][0] - tgt[i][0]) * u, tgt[i][1] + (tgt[j][1] - tgt[i][1]) * u];
  const nCount = Math.max(2, Math.floor(Lmm / stepMm) + 1);
  const xs = new Float32Array(nCount + 1), ys = new Float32Array(nCount + 1), ss = new Float32Array(nCount + 1);
  let cnt = 0, seg = 0;
  for (let q = 0; q <= nCount; q++) {
    const target = Math.min(Lmm, q * stepMm);
    while (seg < m0 - 2 && cum[seg + 1] < target) seg++;
    const span = cum[seg + 1] - cum[seg] || 1e-6, u = clamp((target - cum[seg]) / span);
    const p = pos(seg, seg + 1, u);
    // direction for normal offset
    const a = tgt[Math.max(0, seg - 1)], b = tgt[Math.min(m0 - 1, seg + 2)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const off = bowAmp * wBow(target) + midAmp * wMid(target) + hiAmp * wHi(target);
    xs[cnt] = (p[0] - dy * off) * ppm; ys[cnt] = (p[1] + dx * off) * ppm; ss[cnt] = target * ppm; cnt++;
    if (target >= Lmm) break;
  }
  const n = cnt;
  const P = { n, x: xs.subarray(0, n), y: ys.subarray(0, n), s: ss.subarray(0, n), r: new Float32Array(n), p: new Float32Array(n), flow: new Float32Array(n), Lpx: Lmm * ppm, Lmm, ang0: 0, angMean: 0 };
  P.angMean = Math.atan2(tgt[m0 - 1][1] - tgt[0][1], tgt[m0 - 1][0] - tgt[0][0]);
  // pressure, radius, flow along the stroke
  const prof = o.profile || M.defProfile || 'even';
  const pBase = (o.pressure ?? M.p0) * sp.p * T.pbias;
  const wP = wander(R, 5, 40, 3), wR = wander(R, 1.5, 12, 3);
  const flowFn = makeFlow(S, T, M, Lmm, o, sp);
  const wearMul = 1 + T.wear;
  for (let i = 0; i < n; i++) {
    const s = ss[i] / ppm;
    let p = pBase * profileAt(prof, s, Lmm, o.joinStart, o.joinEnd) * (1 + (M.pvar ?? 0.16) * (o.pwalk ?? 1) * wP(s)); p = clamp(p, 0.02, 1);
    P.p[i] = p;
    let r = M.r0 * wearMul * M.rp(p) * (1 + 0.045 * wR(s)) * T.wmul * (o.wmul ?? 1);
    const f = flowFn(s);
    if (M.swell) r *= 1 + 0.28 * Math.exp(-s / 0.45) + (T.blobEnd ? 0.25 * Math.exp(-(Lmm - s) / 0.4) : 0);
    r *= f.rmul;
    P.r[i] = Math.max(0.55, r * ppm); P.flow[i] = f.flow;
  }
  T.wear += M.wearRate * Lmm * 0.5; // point wears with use
  T.drawn += Lmm;
  return P;
}

// ink flow along a stroke: returns s(mm) -> {flow, rmul}
function makeFlow(S, T, M, Lmm, o, sp) {
  const R = S.R;
  const k = M.flowKind;
  if (k === 'none') return () => ({ flow: 1, rmul: 1 });
  if (k === 'felt' || k === 'technical') {
    const w = wander(R, 3, 30, 3), tech = k === 'technical';
    return (s) => ({ flow: clamp(1 + (tech ? 0.02 : 0.05) * w(s), 0.85, 1.05), rmul: 1 + (tech ? 0.012 : 0.04) * w(s * 1.7 + 9) });
  }
  if (k === 'marker') {
    const w = wander(R, 8, 50, 3), fast = (o.speed === 'fast') ? 0.16 : 0;
    return (s) => ({ flow: clamp(0.93 + 0.13 * w(s) - fast, 0.45, 1.06), rmul: 1 });
  }
  // ballpoint and gel: dropouts, start skip, surges, blobs
  const gel = k === 'gel';
  const rate = (gel ? 0.035 : 0.055) * sp.drop * (o.skips ?? 1) * (1 + 1.6 * Math.max(0, 0.55 - (o.pressure ?? M.p0)));
  const drops = []; { let x = -Math.log(1 - R()) / rate * 0.6; while (x < Lmm) { const len = (gel ? 0.2 + R() * 0.7 : 0.1 + R() * 0.6) * (sp.drop > 2 ? 1.8 : 1); drops.push([x, x + len, R() * (gel ? 0.35 : 0.3)]); x += len + -Math.log(1 - R()) / rate; } }
  const startSkip = R() < (gel ? 0.32 : 0.36) * (o.skips ?? 1) ? [0.15 + R() * (gel ? 0.9 : 0.55)] : null;
  const blobStart = R() < (o.blob ?? (gel ? 0.2 : 0.32) * (Lmm < 6 ? 1.7 : 1)); const blobEnd = R() < (o.blob ?? 0.14) * 0.6;
  T.blobEnd = false;
  const base = clamp(T.flow, 0.6, 1.05);
  const wF = wander(R, 2.2, 26, 4);
  return (s) => {
    let f = base * (1 + (gel ? 0.10 : 0.16) * wF(s)), rm = 1;
    for (const d of drops) {
      if (s > d[0] - 0.12 && s < d[1] + 0.35) {
        const inside = smooth(d[0] - 0.12, d[0] + 0.05, s) * (1 - smooth(d[1] - 0.05, d[1] + 0.1, s));
        f = f * (1 - inside * (1 - d[2]));
        if (s > d[1] + 0.05) f *= 1 + 0.16 * Math.exp(-(s - d[1]) / 0.35); // ink surge after the skip
      }
    }
    if (startSkip) { const q = smooth(0, startSkip[0], s); f *= 0.2 + 0.8 * q; }
    if (blobStart) { const b = Math.exp(-s / (gel ? 0.22 : 0.2)); rm *= 1 + (gel ? 0.24 : 0.4) * b; f *= 1 + 0.35 * b; }
    if (blobEnd) { const b = Math.exp(-(Lmm - s) / 0.18); rm *= 1 + 0.35 * b; f *= 1 + 0.3 * b; }
    return { flow: clamp(f, 0, 1.45), rmul: rm };
  };
}

module.exports = { buildPath, follow, resampleMM };
