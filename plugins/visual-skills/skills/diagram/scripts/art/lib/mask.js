'use strict';
// mask.js — binary part masks on a kit sheet, "colour inside the lines" painting, outline tracing, and sprite cut-out.
// Units: mm in, px internally (S.ppm px per mm). A mask is a Uint8Array(S.W * S.H) of 0/1.
const { createCanvas, ImageData } = require('@napi-rs/canvas');

const ringsOf = (p) => (Array.isArray(p[0][0]) ? p : [p]);

// OR a polygon (ring, or rings even-odd) into mask m
function addPoly(S, m, poly) {
  const { W, H, ppm } = S, rings = ringsOf(poly).map((r) => r.map((p) => [p[0] * ppm, p[1] * ppm]));
  let y0 = 1e9, y1 = -1e9;
  for (const r of rings) for (const p of r) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
    const yc = y + 0.5, xs = [];
    for (const P of rings) for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(W - 1, Math.floor(xs[k + 1] - 0.5)); x++) m[y * W + x] = 1;
  }
  return m;
}
function maskOf(S, shapes) { const m = new Uint8Array(S.W * S.H); for (const s of shapes) addPoly(S, m, s); return m; }
function subtract(S, m, shapes) { const t = maskOf(S, shapes); for (let i = 0; i < m.length; i++) if (t[i]) m[i] = 0; return m; }
function bboxOf(S, m) {
  const { W, H } = S; let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) { const o = y * W; for (let x = 0; x < W; x++) if (m[o + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; } }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

// Paint a region as if it were cut from fresh paper and coloured in: the region goes back to bare paper (whatever was
// drawn there before is now behind it), `draw(rectMM)` lays down marks, then anything that spilt outside the region is
// put back. Outlines are drawn afterwards, unclipped, by the caller.
function paint(S, m, draw, padMM = 9, reset = true) {
  const bb = bboxOf(S, m); if (!bb) return;
  const { W, H, ppm, rgb, fill, paper0 } = S;
  if (reset) for (let y = bb.y0; y <= bb.y1; y++) for (let x = bb.x0; x <= bb.x1; x++) { const i = y * W + x; if (m[i]) { const j = 3 * i; rgb[j] = paper0[j]; rgb[j + 1] = paper0[j + 1]; rgb[j + 2] = paper0[j + 2]; fill[i] = 0; } }
  const pad = Math.round(Math.max(padMM, 0.2 * Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0) / ppm) * ppm), X0 = Math.max(0, bb.x0 - pad), Y0 = Math.max(0, bb.y0 - pad), X1 = Math.min(W - 1, bb.x1 + pad), Y1 = Math.min(H - 1, bb.y1 + pad);
  const bw = X1 - X0 + 1, bh = Y1 - Y0 + 1, sr = new Float32Array(bw * bh * 3), sf = new Uint8Array(bw * bh);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const i = (y + Y0) * W + x + X0, k = y * bw + x; sr[3 * k] = rgb[3 * i]; sr[3 * k + 1] = rgb[3 * i + 1]; sr[3 * k + 2] = rgb[3 * i + 2]; sf[k] = fill[i]; }
  draw({ x0: bb.x0 / ppm, y0: bb.y0 / ppm, x1: (bb.x1 + 1) / ppm, y1: (bb.y1 + 1) / ppm });
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const i = (y + Y0) * W + x + X0; if (m[i]) continue; const k = y * bw + x; rgb[3 * i] = sr[3 * k]; rgb[3 * i + 1] = sr[3 * k + 1]; rgb[3 * i + 2] = sr[3 * k + 2]; fill[i] = sf[k]; }
}

// ---------------------------------------------------------------- contours
// marching squares over a (downsampled) binary grid; returns closed loops in grid-point coordinates
function marching(g, w, h) {
  const v = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : g[y * w + x]);
  const segs = [];
  for (let y = -1; y < h; y++) for (let x = -1; x < w; x++) {
    const c = v(x, y) * 8 + v(x + 1, y) * 4 + v(x + 1, y + 1) * 2 + v(x, y + 1);
    if (c === 0 || c === 15) continue;
    const T = [x + 0.5, y], Rr = [x + 1, y + 0.5], B = [x + 0.5, y + 1], L = [x, y + 0.5];
    switch (c) {
      case 1: segs.push([L, B]); break; case 2: segs.push([B, Rr]); break; case 3: segs.push([L, Rr]); break;
      case 4: segs.push([T, Rr]); break; case 5: segs.push([L, T], [B, Rr]); break; case 6: segs.push([T, B]); break;
      case 7: segs.push([L, T]); break; case 8: segs.push([L, T]); break; case 9: segs.push([T, B]); break;
      case 10: segs.push([T, Rr], [L, B]); break; case 11: segs.push([T, Rr]); break; case 12: segs.push([L, Rr]); break;
      case 13: segs.push([B, Rr]); break; case 14: segs.push([L, B]); break;
    }
  }
  const key = (p) => Math.round(p[0] * 2) * 131071 + Math.round(p[1] * 2);
  const at = new Map();
  segs.forEach((s, i) => { for (const p of s) { const k = key(p); if (!at.has(k)) at.set(k, []); at.get(k).push(i); } });
  const used = new Uint8Array(segs.length), loops = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue; used[i] = 1;
    const loop = [segs[i][0], segs[i][1]]; let cur = segs[i][1];
    for (;;) {
      const cand = (at.get(key(cur)) || []).find((j) => !used[j]); if (cand === undefined) break;
      used[cand] = 1; const s = segs[cand], nxt = key(s[0]) === key(cur) ? s[1] : s[0];
      if (key(nxt) === key(loop[0])) break;
      loop.push(nxt); cur = nxt;
    }
    if (loop.length > 3) loops.push(loop);
  }
  return loops;
}
function downsample(S, m, f) {
  const { W, H } = S, w = Math.ceil(W / f), h = Math.ceil(H / f), g = new Uint8Array(w * h), need = (f * f) / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let n = 0; for (let yy = y * f; yy < Math.min(H, y * f + f); yy++) for (let xx = x * f; xx < Math.min(W, x * f + f); xx++) n += m[yy * W + xx];
    g[y * w + x] = n >= need ? 1 : 0;
  }
  return { g, w, h };
}
function smoothLoop(pts, passes = 2) {
  let p = pts;
  for (let k = 0; k < passes; k++) { const n = p.length, q = new Array(n); for (let i = 0; i < n; i++) { const a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n]; q[i] = [(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4]; } p = q; }
  return p;
}
function loopLength(p) { let L = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); } return L; }
function loopArea(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
// mask -> loops in mm (cell = f px)
function contours(S, m, f = 2, passes = 2) {
  const { g, w, h } = downsample(S, m, f), k = f / S.ppm;
  return marching(g, w, h).map((l) => smoothLoop(l.map((p) => [(p[0] + 0.5) * k, (p[1] + 0.5) * k]), passes));
}
function resampleClosed(p, step) {
  const out = [], n = p.length; let need = 0;
  for (let i = 0; i < n; i++) {
    const a = p[i], b = p[(i + 1) % n]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); let t = need;
    while (t < d) { out.push([a[0] + (b[0] - a[0]) * t / d, a[1] + (b[1] - a[1]) * t / d]); t += step; }
    need = t - d;
  }
  return out;
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1]; let md = 0, mi = 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / L; if (d > md) { md = d; mi = i; } }
  if (md <= eps) return [a, b];
  return rdp(pts.slice(0, mi + 1), eps).slice(0, -1).concat(rdp(pts.slice(mi), eps));
}

// Draw every loop of a mask with a pen: long loops are drawn as a few overlapping strokes, the way a hand goes round a shape.
function outline(S, T, m, o = {}) {
  const R = S.R;
  for (const loop of contours(S, m, o.cell ?? 2, o.passes ?? 2)) {
    const L = loopLength(loop); if (L < (o.minLen ?? 1.5)) continue;
    const pts = resampleClosed(loop, 0.6), n = pts.length; if (n < 4) continue;
    if (o.only) { // only the runs of the loop that lie over the `only` mask (e.g. a hairline where it crosses the face)
      const on = pts.map((p) => { const x = Math.floor(p[0] * S.ppm), y = Math.floor(p[1] * S.ppm); return x >= 0 && y >= 0 && x < S.W && y < S.H && o.only[y * S.W + x] === 1; });
      const s0 = on.indexOf(false); if (s0 < 0) { T.stroke(pts.concat(pts.slice(0, 3)), { smooth: 0.18, tremor: 0.55, profile: 'even' }); continue; }
      let run = [];
      for (let k = 1; k <= n; k++) { const i = (s0 + k) % n; if (on[i]) run.push(pts[i]); else { if (run.length > 3) T.stroke(run, { smooth: 0.18, tremor: 0.55, profile: 'even' }); run = []; } }
      if (run.length > 3) T.stroke(run, { smooth: 0.18, tremor: 0.55, profile: 'even' });
      continue;
    }
    if (o.dash) { // dashes of ~dash mm with ~gap mm between, drifting like a hand's rhythm
      const step = 0.6, dn = Math.max(2, Math.round(o.dash / step)), gn = Math.max(1, Math.round((o.gap ?? 1.6) / step)); let i = Math.floor(R() * (dn + gn));
      while (i < n) { const len = Math.max(2, Math.round(dn * (0.8 + 0.4 * R()))), seg = []; for (let k = 0; k <= len && i + k < n; k++) seg.push(pts[i + k]); if (seg.length > 1) T.stroke(seg, { smooth: 0.12, tremor: 0.5, profile: 'even', pressure: o.pressure }); i += len + gn; }
      continue;
    }
    const parts = Math.max(1, Math.round(L / (o.segLen ?? 55))), start = Math.floor(R() * n), lap = Math.max(2, Math.round(1.4 / 0.6));
    for (let k = 0; k < parts; k++) {
      const a = Math.floor(k * n / parts), b = Math.floor((k + 1) * n / parts) + lap, seg = [];
      for (let i = a; i <= b; i++) seg.push(pts[(start + i) % n]);
      T.stroke(seg, { smooth: o.smooth ?? 0.18, tremor: o.tremor ?? 0.55, profile: o.profile ?? 'even', pressure: o.pressure, exact: o.exact ?? false });
    }
  }
}

function dilate(S, m, rMM) {
  const { W, H } = S, r = Math.max(1, Math.round(rMM * S.ppm)), tmp = new Uint8Array(W * H), out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) { let last = -1e9; const o = y * W; for (let x = 0; x < W; x++) { if (m[o + x]) last = x; if (x - last <= r) tmp[o + x] = 1; } last = 1e9; for (let x = W - 1; x >= 0; x--) { if (m[o + x]) last = x; if (last - x <= r) tmp[o + x] = 1; } }
  // vertical pass on the horizontally dilated mask (a square structuring element, then rounded by the blur in cutout)
  for (let x = 0; x < W; x++) { let last = -1e9; for (let y = 0; y < H; y++) { if (tmp[y * W + x]) last = y; if (y - last <= r) out[y * W + x] = 1; } last = 1e9; for (let y = H - 1; y >= 0; y--) { if (tmp[y * W + x]) last = y; if (last - y <= r) out[y * W + x] = 1; } }
  return out;
}
function blurAlpha(S, m, rpx) { // box blur twice -> Float32 0..1
  const { W, H } = S; let a = Float32Array.from(m), b = new Float32Array(W * H);
  const pass = (src, dst, horiz) => { const n = horiz ? W : H, lines = horiz ? H : W, k = 1 / (2 * rpx + 1);
    for (let l = 0; l < lines; l++) { let acc = 0; const at = (i) => (horiz ? src[l * W + Math.min(n - 1, Math.max(0, i))] : src[Math.min(n - 1, Math.max(0, i)) * W + l]);
      for (let i = -rpx; i <= rpx; i++) acc += at(i);
      for (let i = 0; i < n; i++) { if (horiz) dst[l * W + i] = acc * k; else dst[i * W + l] = acc * k; acc += at(i + rpx + 1) - at(i - rpx); } } };
  for (let it = 0; it < 2; it++) { pass(a, b, true); pass(b, a, false); }
  return a;
}

// Cut the drawing out of its sheet: opaque (paper and all) inside the silhouette, and outside it only the marks themselves
// (colour-to-alpha against the bare paper), so a stray overshoot or a ground shadow survives without a paper rectangle.
function cutout(S, silhouette, o = {}) {
  const { W, H, rgb, paper0 } = S;
  const a = blurAlpha(S, dilate(S, silhouette, o.grow ?? 0.55), Math.max(1, Math.round(S.ppm * 0.12)));
  const out = new Uint8ClampedArray(W * H * 4);
  for (let i = 0, n = W * H; i < n; i++) {
    const j = 3 * i; let am = a[i]; am = am > 0.5 ? 1 : am * 2; // hard-ish edge, a hair of anti-aliasing
    let ac = 0; for (let c = 0; c < 3; c++) { const p = paper0[j + c], v = rgb[j + c]; if (Math.abs(v - p) < 3) continue; const d = v < p ? (p - v) / p : (v - p) / Math.max(24, 255 - p); if (d > ac) ac = d; }
    ac = ac < 0.04 ? 0 : Math.min(1, (ac - 0.04) / 0.96 * 1.1);
    const A = am + (1 - am) * ac; if (A <= 0.003) continue;
    for (let c = 0; c < 3; c++) {
      const v = Math.min(255, Math.max(0, rgb[j + c])), p = paper0[j + c];
      const C = ac > 0 ? Math.min(255, Math.max(0, (v - (1 - ac) * p) / ac)) : v;
      out[4 * i + c] = (am * v + (1 - am) * ac * C) / A;
    }
    out[4 * i + 3] = A * 255;
  }
  if (o.crop === false) { const canvas = createCanvas(W, H); canvas.getContext('2d').putImageData(new ImageData(out, W, H), 0, 0); return { canvas, box: { x0: 0, y0: 0, w: S.w, h: S.h } }; }
  // crop to what is there, plus a margin
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (out[4 * (y * W + x) + 3] > 6) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const mg = Math.round((o.margin ?? 1.5) * S.ppm); x0 = Math.max(0, x0 - mg); y0 = Math.max(0, y0 - mg); x1 = Math.min(W - 1, x1 + mg); y1 = Math.min(H - 1, y1 + mg);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, crop = new Uint8ClampedArray(cw * ch * 4);
  for (let y = 0; y < ch; y++) crop.set(out.subarray(4 * ((y + y0) * W + x0), 4 * ((y + y0) * W + x0 + cw)), 4 * y * cw);
  const canvas = createCanvas(cw, ch); canvas.getContext('2d').putImageData(new ImageData(crop, cw, ch), 0, 0);
  return { canvas, box: { x0: x0 / S.ppm, y0: y0 / S.ppm, w: cw / S.ppm, h: ch / S.ppm } };
}

// the silhouette as one simplified polygon (largest outer loop), in mm
function hull(S, silhouette, eps = 0.9) {
  const grown = dilate(S, silhouette, 1.2);
  const loops = contours(S, grown, 4, 1).sort((p, q) => Math.abs(loopArea(q)) - Math.abs(loopArea(p)));
  if (!loops.length) return [];
  // simplify a closed loop: split it at the point farthest from its start, simplify both halves
  const l = loops[0]; let far = 0, fd = -1;
  for (let i = 0; i < l.length; i++) { const d = Math.hypot(l[i][0] - l[0][0], l[i][1] - l[0][1]); if (d > fd) { fd = d; far = i; } }
  return rdp(l.slice(0, far + 1), eps).slice(0, -1).concat(rdp(l.slice(far).concat([l[0]]), eps).slice(0, -1));
}

module.exports = { addPoly, maskOf, subtract, bboxOf, paint, contours, outline, dilate, cutout, hull, loopLength, resampleClosed };
