'use strict';
// kit-a — a per-pixel deposit model of pencil, ballpoint, pen, marker and crayon on real-ish paper.
//   const K = require('../lib/kit-a'); const S = K.sheet({ id, w, h, ppm, paper, seed }); const T = S.tool('graphite', { grade: '2B' });
// Units are millimetres, origin top-left, y down. See notes/KIT-CONTRACT.md and notes/kits/a/README.md.
const fs = require('fs');
const path = require('path');
const { createCanvas, ImageData } = require('@napi-rs/canvas');
const { rng, clamp, hashStr, TAU, wander } = require('./util');
const { buildPaper } = require('./paper');
const { make } = require('./media');
const { buildPath } = require('./hand');
const { sweep, stamp } = require('./raster');
const shapes = require('./shapes');

const DEF_PROFILE = { graphite: 'taper', pencil: 'taper', colerase: 'taper', pastelpencil: 'taper', crayon: 'taper', ballpoint: 'even', fineliner: 'even', gel: 'even', marker: 'even' };
const deg = (d) => d * Math.PI / 180;

// ---------------------------------------------------------------- 2-D gradient noise (for sheets that want it)
function makeNoise(seed) {
  const R = rng('noise:' + seed), p = new Uint8Array(512), perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i; for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const G = []; for (let i = 0; i < 16; i++) G.push([Math.cos(i / 16 * TAU), Math.sin(i / 16 * TAU)]);
  const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const g = (a, b, dx, dy) => { const v = G[p[p[a] + b] & 15]; return v[0] * dx + v[1] * dy; };
    const u = f(xf), v = f(yf);
    const a = g(X, Y, xf, yf), b = g(X + 1, Y, xf - 1, yf), c = g(X, Y + 1, xf, yf - 1), d = g(X + 1, Y + 1, xf - 1, yf - 1);
    return (a + (b - a) * u + ((c + (d - c) * u) - (a + (b - a) * u)) * v) * 1.4;
  };
  const fbm2 = (x, y, oct = 4) => { let s = 0, a = 1, fr = 1, n = 0; for (let i = 0; i < oct; i++) { s += a * n2(x * fr, y * fr); n += a; a *= 0.5; fr *= 2; } return s / n; };
  return { n2, fbm2 };
}

class Tool {
  constructor(S, kind, opts) {
    this.S = S; this.kind = kind; this.opts = opts || {};
    this.med = make(S, kind, this.opts); this.med.defProfile = DEF_PROFILE[kind] || 'even';
    this.sharpen();
    this.dirSame = true; this.tremorMul = 1;
  }
  sharpen() { const R = this.S.R; this.wear = 0; this.wmul = 1 + R.gauss(0, 0.035); this.pbias = clamp(1 + R.gauss(0, 0.06), 0.85, 1.15); this.flow = clamp(0.93 + R.gauss(0, 0.04), 0.8, 1.02); this.drawn = 0; }
  reload() { this.sharpen(); }
  _drift() { const R = this.S.R; this.pbias = clamp(this.pbias + R.gauss(0, 0.014) + 0.03 * (1 - this.pbias), 0.8, 1.2); this.flow = clamp(this.flow + R.gauss(0, 0.02) - 0.0004, 0.6, 1.05); this.wmul = clamp(this.wmul + R.gauss(0, 0.008) + 0.05 * (1 - this.wmul), 0.9, 1.12); }
  _paint(P, o = {}) {
    const S = this.S, M = this.med;
    M.L = P.Lpx; M.laneShift = (S.R() * 512) | 0;
    if (M.mode === 'sweep') sweep(S, P, M);
    else {
      const ppm = S.ppm; let hw = M.nibW * 0.5 * ppm, hh = M.nibH * 0.5 * ppm;
      const ang = M.nibAng !== undefined ? M.nibAng + (o.nibJitter ?? S.R.gauss(0, 0.05)) : P.angMean + Math.PI / 2 + S.R.gauss(0, 0.18);
      stamp(S, P, M, { hw, hh, ang, wick: M.wick, rot: (M.nibRot || 0) * (S.R.gauss(0, 1)) });
    }
    this._drift();
  }
  // ---- marks
  stroke(pts, o = {}) {
    if (pts.length < 1) return;
    if (pts.length === 1) return this.dot(pts[0], o);
    const P = buildPath(this.S, this, pts, o); this._paint(P, o); return P;
  }
  line(a, b, o = {}) { return this.stroke([a, b], o); }
  ruled(a, b, o = {}) {
    const S = this.S, R = S.R, len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (len < 0.05) return;
    const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, nx = -uy, ny = ux;
    const lean0 = R.gauss(0, 0.04), lean1 = R.gauss(0, 0.05);
    const over0 = Math.max(-0.3, R.gauss(0.05, 0.22)), over1 = Math.max(-0.3, R.gauss(0.28, 0.3)) * (o.overshoot ?? 1);
    const A = [a[0] - ux * over0 + nx * lean0, a[1] - uy * over0 + ny * lean0], B = [b[0] + ux * over1 + nx * lean1, b[1] + uy * over1 + ny * lean1];
    const oo = { tremor: 0.3, bow: 0.06, smooth: 0.12, speed: 'normal', ...o };
    const splitP = len > 45 ? Math.min(0.5, 0.12 + len / 800) : 0;
    if (R() < splitP) {
      const t = 0.35 + R() * 0.3, M0 = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t], sh = R.gauss(0, 0.07), ov = 0.6 + R() * 2.2;
      this.stroke([A, [M0[0] + ux * ov * 0.2, M0[1] + uy * ov * 0.2]], oo);
      this.stroke([[M0[0] - ux * ov + nx * sh, M0[1] - uy * ov + ny * sh], B], { ...oo, profile: oo.profile === 'even' || !oo.profile ? 'even' : oo.profile });
    } else this.stroke([A, B], oo);
  }
  poly(pts, closed = false, o = {}) {
    const n = pts.length, R = this.S.R, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = pts[i], b = pts[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
      const e0 = R.gauss(0.05, 0.3), e1 = R.gauss(0.1, 0.32);
      this.stroke([[a[0] - ux * e0, a[1] - uy * e0], [b[0] + ux * e1, b[1] + uy * e1]], o);
    }
  }
  ruledPoly(pts, closed = false, o = {}) {
    const n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) this.ruled(pts[i], pts[(i + 1) % n], o);
  }
  circle(c, r, o = {}) { return this.ellipse(c, r, r, 0, o); }
  ellipse(c, rx, ry, rot = 0, o = {}) {
    const S = this.S, R = S.R, rmax = Math.max(rx, ry);
    const start = R() * TAU, dir = R() < 0.78 ? -1 : 1;
    const turn = 1 + (o.gap !== undefined ? -o.gap : R.range(-0.025, 0.09)), spiral = R.gauss(0, 0.012) + (o.spiral || 0);
    const wb = wander(R, 0.6, 3.2, 3), sq = 1 + R.gauss(0, 0.02), tilt = R() * Math.PI;
    const n = Math.max(14, Math.ceil(turn * TAU * rmax / 1.8)), pts = [];
    for (let i = 0; i <= n; i++) {
      const q = i / n * turn, th = start + dir * q * TAU;
      const k = 1 + spiral * q + 0.006 * wb(q * TAU * rmax * 0.5) * 2;
      let x = Math.cos(th) * rx * k, y = Math.sin(th) * ry * k;
      // slight egg / squash
      const xe = x * Math.cos(tilt) + y * Math.sin(tilt), ye = -x * Math.sin(tilt) + y * Math.cos(tilt);
      x = xe * sq; y = ye / sq; const xr = x * Math.cos(-tilt) + y * Math.sin(-tilt) - 0, yr = -x * Math.sin(-tilt) + y * Math.cos(-tilt);
      pts.push([c[0] + xr * Math.cos(rot) - yr * Math.sin(rot), c[1] + xr * Math.sin(rot) + yr * Math.cos(rot)]);
    }
    return this.stroke(pts, { smooth: Math.min(0.35, rmax * 0.12), ...o });
  }
  compass(c, r, a0, a1, o = {}) {
    const S = this.S, R = S.R, span = a1 - a0, n = Math.max(6, Math.ceil(Math.abs(span) * r / 1.5)), pts = [];
    const rr = r + R.gauss(0, 0.03);
    for (let i = 0; i <= n; i++) { const th = a0 + span * i / n; pts.push([c[0] + Math.cos(th) * rr, c[1] + Math.sin(th) * rr]); }
    if (o.pin) this.pinhole(c);
    return this.stroke(pts, { tremor: 0.22, bow: 0, smooth: 0.15, profile: 'even', exact: false, ...o });
  }
  pinhole(c) { // a compass point: a tiny dark dent with a lighter centre
    const S = this.S, ppm = S.ppm, x = c[0] * ppm, y = c[1] * ppm, r = 0.28 * ppm, R = Math.ceil(r + 2);
    for (let yy = Math.floor(y - R); yy <= Math.ceil(y + R); yy++) for (let xx = Math.floor(x - R); xx <= Math.ceil(x + R); xx++) {
      if (xx < 0 || yy < 0 || xx >= S.W || yy >= S.H) continue;
      const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y), i = 3 * (yy * S.W + xx);
      let k = 0; if (d < r * 0.4) k = 0.08 - 0.0; else if (d < r) k = -0.12 * (1 - (d - r * 0.4) / (r * 0.6));
      // ring darker (crushed paper), centre slightly lighter (the hole)
      const f = 1 + k * (d < r * 0.4 ? 1 : 1);
      S.rgb[i] *= f; S.rgb[i + 1] *= f; S.rgb[i + 2] *= f;
    }
  }
  dot(p, o = {}) {
    const S = this.S, M = this.med, ppm = S.ppm, R = S.R;
    const k = o.size ?? 1;
    const r = M.r0 * (M.kind === 'ballpoint' || M.kind === 'gel' ? 1.35 : M.kind === 'fineliner' ? 1.5 : 1.1) * this.wmul * (1 + this.wear) * k * ppm * (1 + R.gauss(0, 0.08));
    const P = { n: 1, x: Float32Array.of(p[0] * ppm), y: Float32Array.of(p[1] * ppm), r: Float32Array.of(Math.max(0.7, r)), p: Float32Array.of(clamp((o.pressure ?? M.p0) * 1.05, 0.05, 1)), s: Float32Array.of(0), flow: Float32Array.of(M.flowKind === 'none' ? 1 : 1.15), Lpx: 1, angMean: 0 };
    if (M.mode === 'stamp') { P.n = 2; P.x = Float32Array.of(P.x[0], P.x[0] + 0.01); P.y = Float32Array.of(P.y[0], P.y[0]); P.r = Float32Array.of(r, r); P.p = Float32Array.of(P.p[0], P.p[0]); P.s = Float32Array.of(0, 0.1); P.flow = Float32Array.of(1, 1); }
    this._paint(P, o);
  }
  // ---- regions (a polygon is a ring [[x,y],...] or an array of rings for holes, even-odd)
  _rot(poly, ang) { const c = Math.cos(ang), s = Math.sin(ang), f = (r) => r.map((p) => [p[0] * c + p[1] * s, -p[0] * s + p[1] * c]); return Array.isArray(poly[0][0]) ? poly.map(f) : [f(poly)]; }
  _unrot(pt, ang) { const c = Math.cos(ang), s = Math.sin(ang); return [pt[0] * c - pt[1] * s, pt[0] * s + pt[1] * c]; }
  _rows(rings, y) { const xs = []; for (const poly of rings) { const n = poly.length; for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); } } xs.sort((p, q) => p - q); const iv = []; for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 0.05) iv.push([xs[i], xs[i + 1]]); return iv; }
  _yrange(rings) { let ymin = 1e9, ymax = -1e9; for (const r of rings) for (const p of r) { if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; } return [ymin, ymax]; }
  hatch(polygon, o = {}) {
    const S = this.S, R = S.R, M = this.med;
    const sets = 1 + Math.round(o.cross || 0), pitch0 = o.pitch ?? 1.0, drift = o.drift ?? 1, over = o.over ?? 0.55, lenMax = o.length ?? 14;
    const a0 = o.angle ?? 45, angles = [a0, a0 + 62 + R.gauss(0, 4), a0 + 118 + R.gauss(0, 5), a0 - 28 + R.gauss(0, 4), a0 + 90 + R.gauss(0, 3), a0 + 150 + R.gauss(0, 4)];
    const curve0 = (o.curve ?? 0.022) * (R() < 0.5 ? 1 : -1), vary = o.vary ?? 1;
    for (let k = 0; k < sets; k++) {
      const ang = deg(angles[k]), rings = this._rot(polygon, ang), [ymin, ymax] = this._yrange(rings);
      let y = ymin + R() * pitch0 * 0.6, w = 0, aw = 0, pw = 0, dirFlip = R() < 0.5, up = true;
      const pr0 = (o.pressure ?? M.p0) * (k === 0 ? 1 : 0.92);
      while (y < ymax) {
        const ivs = this._rows(rings, y);
        pw = 0.85 * pw + R.gauss(0, 0.06) * drift; pw = clamp(pw, -0.3, 0.3);
        for (const [xa, xb] of ivs) {
          let xs = xa - Math.max(-0.5, R.gauss(0.1, 0.4)) * over, xe = xb + Math.max(-0.5, R.gauss(0.15, 0.4)) * over;
          let pos = xs, first = true;
          while (pos < xe - 0.15) {
            const remain = xe - pos, last = remain <= lenMax * 1.25, cl = last ? remain : lenMax * (0.55 + R() * 0.7);
            const x0 = pos, x1 = pos + cl;
            const sag = (curve0 + R.gauss(0, 0.012)) * cl, slope = Math.tan(aw + R.gauss(0, 0.012 * drift)) * cl;
            const pts = [[x0, y], [x0 + cl * 0.5, y - sag + slope * 0.5], [x1, y + slope]];
            if (R() < 0.045) pts.push([x1 + R.gauss(0, 0.3), y + slope + (R() < 0.5 ? -1 : 1) * (0.35 + R() * 0.5)]);
            const flip = (dirFlip !== up);
            const arr = (flip ? pts.slice().reverse() : pts).map((q) => this._unrot(q, ang));
            // stroke-to-stroke character: a heavier stroke now and then, a lighter one, width following pressure
            let pm = 1 + 0.13 * vary * R.gauss(0, 1); const rr = R(); if (rr < 0.05) pm *= 1.32; else if (rr < 0.12) pm *= 0.7;
            const jS = !first, jE = !last;
            this.stroke(arr, { pressure: clamp(pr0 * (1 + pw) * pm, 0.05, 1), wmul: clamp(0.94 + 0.1 * (pm - 1) * 4 * vary, 0.82, 1.3), profile: o.profile || (M.dry ? 'hatch' : 'taper'), speed: R() < (o.fast ?? 0.22) ? 'fast' : 'normal', tremor: o.tremor, joinStart: flip ? jE : jS, joinEnd: flip ? jS : jE });
            first = false;
            if (last) break;
            pos = x1 - (0.9 + R() * 1.2);
          }
        }
        y += pitch0 * (1 + w); w = clamp(0.9 * w + R.gauss(0, 0.07) * drift, -0.4, 0.4); aw = 0.92 * aw + R.gauss(0, 0.012) * drift; aw = clamp(aw, -0.12, 0.12);
        if (R() < 0.35) up = !up; else if (o.zig) up = !up;
      }
    }
  }
  hatchIn(polygon, o = {}) { return this.hatch(polygon, o); }
  // Layered hatch sets until the *measured* coverage of the region reaches value * toneMax. value 0..1 is roughly linear in
  // the fraction of full pigment contrast (see S.coverage). The sum of marks; never a fill.
  tone(polygon, o = {}) {
    const S = this.S, M = this.med, R = S.R, v = clamp(o.value ?? 0.5, 0, 1);
    const target = v * (o.toneMax ?? M.toneMax ?? 0.9); if (target < 0.015) return 0;
    const lw = M.r0 * 2 * (M.rp0 + M.rp1 * M.p0) * (M.mode === 'stamp' ? 6 : 1);
    const a0 = o.angle ?? 40 + R.gauss(0, 5);
    const angs = [a0, a0 + 62 + R.gauss(0, 4), a0 + 118 + R.gauss(0, 5), a0 - 28 + R.gauss(0, 4), a0 + 90 + R.gauss(0, 3), a0 + 150 + R.gauss(0, 4), a0 + 45, a0 + 10];
    let cur = S.coverage(polygon, M), fEst = o.f ?? 0.55;
    for (let k = 0; k < angs.length && cur < target - 0.02; k++) {
      let pass = 1 - (1 - target) / Math.max(0.05, 1 - cur); pass = clamp(pass, 0.04, 0.82);
      const pitch = clamp(o.pitch && k === 0 ? o.pitch : fEst * lw / pass, lw * 0.75, lw * 3.6);
      const before = cur;
      this.hatch(polygon, { angle: angs[k], pitch, pressure: (o.pressure ?? M.p0) * (0.6 + 0.6 * pass), over: o.over ?? 0.45, ...o.hatch });
      cur = S.coverage(polygon, M);
      const g = 1 - (1 - cur) / Math.max(0.05, 1 - before);
      if (g > 0.01) fEst = clamp(0.5 * fEst + 0.5 * g * pitch / lw, 0.15, 1.2);
    }
    return cur;
  }
  stipple(polygon, o = {}) { // dots scattered inside a polygon: density per mm², pressure/size vary; clumps and gaps by a noise field
    const S = this.S, R = S.R, rings = Array.isArray(polygon[0][0]) ? polygon : [polygon], [ymin, ymax] = this._yrange(rings);
    let xmin = 1e9, xmax = -1e9; for (const r of rings) for (const p of r) { if (p[0] < xmin) xmin = p[0]; if (p[0] > xmax) xmax = p[0]; }
    const inside = (x, y) => { let c = false; for (const r of rings) { for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } } return c; };
    const dens = o.density ?? 2, n = Math.round((xmax - xmin) * (ymax - ymin) * dens * 1.6), nz = S.noise(S.seed + 'st'), sc = o.clump ?? 0.08;
    for (let i = 0; i < n; i++) { const x = xmin + R() * (xmax - xmin), y = ymin + R() * (ymax - ymin); if (!inside(x, y)) continue; if (o.clump !== 0 && R() > 0.5 + 0.55 * nz.n2(x * sc, y * sc)) continue; if (R() > 0.62) continue; this.dot([x, y], { size: (o.size ?? 1) * (0.7 + 0.7 * R()), pressure: (o.pressure ?? this.med.p0) * (0.7 + 0.5 * R()) }); }
  }
  scribble(polygon, o = {}) {
    const S = this.S, R = S.R, pitch = o.pitch ?? 1.1, ang = deg(o.angle ?? 30 + R.gauss(0, 8)), poly = this._rot(polygon, ang);
    const [ymin, ymax] = this._yrange(poly);
    let y = ymin + R() * pitch, dir = 1, pts = [], lastIv = null, w = 0;
    const flush = () => { if (pts.length > 2) this.stroke(pts.map((q) => this._unrot(q, ang)), { smooth: o.smooth ?? 0.5, pressure: o.pressure, profile: 'even', tremor: 1.2 }); pts = []; };
    while (y < ymax) {
      const ivs = this._rows(poly, y);
      if (!ivs.length) { flush(); y += pitch; continue; }
      const iv = ivs.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
      if (lastIv && (iv[1] < lastIv[0] || iv[0] > lastIv[1])) flush();
      const xa = iv[0] - R() * 0.4, xb = iv[1] + R() * 0.4;
      const yy = y + R.gauss(0, 0.15);
      if (dir > 0) { pts.push([xa, yy], [xb, yy + pitch * 0.5]); } else { pts.push([xb, yy], [xa, yy + pitch * 0.5]); }
      dir = -dir; lastIv = iv; w = 0.85 * w + R.gauss(0, 0.08); y += pitch * clamp(1 + w, 0.6, 1.5);
    }
    flush();
  }
  fillWith(polygon, o = {}) {
    const S = this.S, R = S.R, M = this.med, ang = deg(o.angle ?? 0), poly = this._rot(polygon, ang);
    let eff;
    if (M.mode === 'stamp') { const na = (M.nibAng ?? 0), dirA = ang; eff = M.nibW * Math.abs(Math.sin(dirA - na)) + M.nibH * Math.abs(Math.cos(dirA - na)); eff = Math.max(eff, M.nibH); }
    else eff = M.r0 * 2;
    const pitch = o.pitch ?? eff * (o.overlap === undefined ? 0.82 : 1 - o.overlap);
    const [ymin, ymax] = this._yrange(poly);
    let y = ymin + pitch * 0.4, dir = R() < 0.5 ? 1 : -1, w = 0;
    while (y < ymax + pitch * 0.4) {
      const ivs = this._rows(poly, clamp(y, ymin + 0.01, ymax - 0.01));
      for (const [xa, xb] of ivs) {
        const jx = M.mode === 'stamp' || M.r0 > 1 ? 1.6 : 0.6, a = xa - R.range(-jx * 0.6, jx), b = xb + R.range(-jx * 0.6, jx), yy = y + R.gauss(0, 0.04 * pitch);
        const pts = dir > 0 ? [[a, yy], [(a + b) / 2, yy + R.gauss(0, 0.05)], [b, yy]] : [[b, yy], [(a + b) / 2, yy + R.gauss(0, 0.05)], [a, yy]];
        this.stroke(pts.map((q) => this._unrot(q, ang)), { profile: o.profile || (M.dry ? 'hatch' : 'even'), pressure: o.pressure, speed: o.speed, tremor: 0.6 });
      }
      dir = o.zig === false ? dir : -dir; w = 0.85 * w + R.gauss(0, 0.06); y += pitch * clamp(1 + w, 0.7, 1.35);
    }
  }
  smudge(polygon, o = {}) { this.S.smudge(polygon, o); }
}

// ---------------------------------------------------------------- the sheet
function sheet(cfg) {
  const { id = 'sheet', w = 297, h = 210, ppm = 10, paper = 'cartridge', seed = id } = cfg;
  const W = Math.round(w * ppm), H = Math.round(h * ppm);
  if (W * H > 18.5e6) throw new Error(`sheet too big: ${W}x${H} = ${(W * H / 1e6).toFixed(1)} MP`); // A3 at 12 px/mm is 18 MP (~1.1 GB RSS): one such render at a time
  const S = { id, w, h, ppm, W, H, seed: String(seed) };
  S.R = rng('draw:' + S.seed);
  S.noise = makeNoise;
  buildPaper(S, paper);
  S.rgb; S.fill = new Uint8Array(W * H); S.cov = new Float32Array(W * H);
  S.tool = (kind, opts) => new Tool(S, kind, opts);
  S.px = (mm) => mm * ppm;
  Object.defineProperty(S, 'ctx', { get() { if (!S._ov) { S.canvas = createCanvas(W, H); S._ov = S.canvas.getContext('2d'); S._ov.scale(ppm, ppm); } return S._ov; } });
  S.erase = (polygon, o = {}) => erase(S, polygon, o);
  S.coverage = (polygon, tool, step) => coverage(S, polygon, tool.med || tool, step);
  S.smudge = (polygon, o = {}) => smudge(S, polygon, o);
  S.finish = async (opts = {}) => finish(S, opts);
  S.toCanvas = () => toCanvas(S);
  return S;
}

function polyMask(S, poly, fn, step = 1) { // scanline (even-odd, rings allowed) over a polygon in mm; fn(x,y,i)
  const ppm = S.ppm, rings = (Array.isArray(poly[0][0]) ? poly : [poly]).map((r) => r.map((p) => [p[0] * ppm, p[1] * ppm])); let y0 = 1e9, y1 = -1e9;
  for (const r of rings) for (const p of r) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(S.H - 1, Math.ceil(y1)); y += step) {
    const yc = y + 0.5, xs = [];
    for (const P of rings) for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(S.W - 1, Math.floor(xs[k + 1] - 0.5)); x += step) fn(x, y, y * S.W + x);
  }
}
// How much of a medium's full pigment contrast a region has reached (0 = bare paper, 1 = solid pigment): the projection of
// (pixel - paper) on (pigment - paper), averaged over the polygon. tone() closes its loop on this.
function coverage(S, poly, med, step = 2) {
  if (!S._pm) { let a = 0, b = 0, c = 0, n = 0; for (let i = 0; i < S.W * S.H; i += 97) { a += S.paper0[3 * i]; b += S.paper0[3 * i + 1]; c += S.paper0[3 * i + 2]; n++; } S._pm = [a / n, b / n, c / n]; }
  const pm = S._pm; let e;
  if (med.comp === 1) e = [0, 1, 2].map((c) => pm[c] * (Math.exp(-med.k[c]) - 1)); else e = [0, 1, 2].map((c) => med.col[c] - pm[c]);
  const ee = e[0] * e[0] + e[1] * e[1] + e[2] * e[2]; if (ee < 1) return 0;
  let sum = 0, n = 0, rgb = S.rgb;
  polyMask(S, poly, (x, y, i) => { const j = 3 * i; sum += ((rgb[j] - S.paper0[j]) * e[0] + (rgb[j + 1] - S.paper0[j + 1]) * e[1] + (rgb[j + 2] - S.paper0[j + 2]) * e[2]) / ee; n++; }, step);
  return n ? clamp(sum / n, 0, 1.2) : 0;
}
function ragged(S, poly, amp = 1.2) { // subdivide and wobble a polygon so a smudge or erasure has a hand's edge
  const R = S.R, out = [];
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2)), w = wander(R, 3, 20, 3);
    for (let k = 0; k < n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, d = w(i * 40 + k * 2) * amp; out.push([x + d * 0.7, y + d]); } }
  return out;
}
function erase(S, poly, o) {
  poly = ragged(S, poly, o.ragged ?? 1.0);
  const k = o.strength ?? 0.85, R = S.R;
  polyMask(S, poly, (x, y, i) => {
    const f = S.fill[i]; if (f === 0 && S.cov[i] === 0) { /* may still hold pigment; lift proportional to how far rgb is from paper */ }
    const j = 3 * i, kk = k * (0.85 + 0.3 * S.tooth[i]);
    for (let c = 0; c < 3; c++) S.rgb[j + c] += (S.paper0[j + c] - S.rgb[j + c]) * kk;
    S.fill[i] = f * (1 - kk);
  });
}
function smudge(S, poly, o) {
  poly = ragged(S, poly, o.ragged ?? 1.6);
  const ppm = S.ppm, len = Math.round((o.length ?? 5) * ppm), ang = o.angle ?? -0.3, dx = Math.cos(ang), dy = Math.sin(ang), amt = o.amount ?? 0.6;
  const idx = [], d = []; polyMask(S, poly, (x, y, i) => { idx.push(i); });
  // delta = paper - rgb, smeared along a direction; new = paper - mix(delta, smeared)
  const snap = new Float32Array(idx.length * 3);
  const W = S.W, H = S.H;
  for (let n = 0; n < idx.length; n++) { const i = idx[n], x = i % W, y = (i / W) | 0; let acc0 = 0, acc1 = 0, acc2 = 0, cnt = 0;
    for (let t = -len; t <= len; t += 2) { const xx = Math.round(x + dx * t), yy = Math.round(y + dy * t); if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = 3 * (yy * W + xx); acc0 += S.paper0[j] - S.rgb[j]; acc1 += S.paper0[j + 1] - S.rgb[j + 1]; acc2 += S.paper0[j + 2] - S.rgb[j + 2]; cnt++; }
    snap[3 * n] = acc0 / cnt; snap[3 * n + 1] = acc1 / cnt; snap[3 * n + 2] = acc2 / cnt; }
  for (let n = 0; n < idx.length; n++) { const j = 3 * idx[n]; for (let c = 0; c < 3; c++) { const cur = S.paper0[j + c] - S.rgb[j + c]; S.rgb[j + c] = S.paper0[j + c] - (cur + (snap[3 * n + c] - cur) * amt) * (0.9); } }
}

function toCanvas(S) {
  const { W, H } = S;
  const buf = new Uint8ClampedArray(W * H * 4);
  for (let i = 0, n = W * H; i < n; i++) { buf[4 * i] = S.rgb[3 * i]; buf[4 * i + 1] = S.rgb[3 * i + 1]; buf[4 * i + 2] = S.rgb[3 * i + 2]; buf[4 * i + 3] = 255; }
  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(buf, W, H), 0, 0);
  if (S._ov) ctx.drawImage(S.canvas, 0, 0);
  return canvas;
}

async function finish(S, opts) {
  const { W, H } = S;
  const out = opts.out || path.join(process.cwd(), 'out', S.id + '.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const canvas = toCanvas(S);
  fs.writeFileSync(out, await canvas.encode('png'));
  const long = Math.max(W, H), k = Math.min(1, 1600 / long), pw = Math.round(W * k), ph = Math.round(H * k);
  const pc = createCanvas(pw, ph), pctx = pc.getContext('2d'); pctx.imageSmoothingQuality = 'high'; pctx.drawImage(canvas, 0, 0, pw, ph);
  const prev = out.replace(/\.png$/, '') + '-preview.png';
  fs.writeFileSync(prev, await pc.encode('png'));
  return { out, prev };
}

shapes.install(Tool);
module.exports = { sheet, Tool, makeNoise, geom: shapes.geom, persp: shapes.persp, shapes: { geom: shapes.geom, persp: shapes.persp } };
