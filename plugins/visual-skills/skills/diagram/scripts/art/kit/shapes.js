'use strict';
// shapes.js — generic builder helpers. Everything drawn goes through the tool `T`, so it inherits the tool's physics.
// Units mm. Installed as methods on Tool (T.puffChain, T.hexCell, T.dial, ...) and exposed as K.geom / K.persp / K.shapes.
const { clamp, TAU } = require('./util');

// ---------------------------------------------------------------- geometry
const isRings = (p) => Array.isArray(p[0][0]);
const ringsOf = (p) => (isRings(p) ? p : [p]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]);
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function signedArea(r) { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
const area = (poly) => ringsOf(poly).reduce((s, r, i) => s + (i === 0 ? Math.abs(signedArea(r)) : -Math.abs(signedArea(r))), 0);
function centroid(r) { let a = 0, cx = 0, cy = 0; for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length], f = p[0] * q[1] - q[0] * p[1]; a += f; cx += (p[0] + q[0]) * f; cy += (p[1] + q[1]) * f; } if (Math.abs(a) < 1e-9) return r[0].slice(); return [cx / (3 * a), cy / (3 * a)]; }
function bbox(poly) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of ringsOf(poly)) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; }
function pointInPoly(p, poly) { let c = false; for (const r of ringsOf(poly)) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
// grow (d > 0) or shrink (d < 0) a ring by moving each vertex along its miter (fine for gentle shapes)
function offsetPoly(r, d) {
  const n = r.length, sgn = signedArea(r) >= 0 ? 1 : -1, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = r[(i + n - 1) % n], p1 = r[i], p2 = r[(i + 1) % n];
    let e1 = sub(p1, p0), e2 = sub(p2, p1); const l1 = len(e1) || 1, l2 = len(e2) || 1; e1 = mul(e1, 1 / l1); e2 = mul(e2, 1 / l2);
    const n1 = [e1[1] * sgn, -e1[0] * sgn], n2 = [e2[1] * sgn, -e2[0] * sgn]; // outward normals
    let m = add(n1, n2); const ml = len(m) || 1; m = mul(m, 1 / ml); const k = 1 / Math.max(0.35, m[0] * n1[0] + m[1] * n1[1]);
    out.push([p1[0] + m[0] * d * k, p1[1] + m[1] * d * k]);
  }
  return out;
}
// the parts of segment a-b inside poly (even-odd, rings ok): [[p,q],...]
function clipLine(a, b, poly) {
  const ts = [0, 1]; const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const r of ringsOf(poly)) for (let i = 0; i < r.length; i++) {
    const c = r[i], d = r[(i + 1) % r.length], ex = d[0] - c[0], ey = d[1] - c[1], den = dx * ey - dy * ex; if (Math.abs(den) < 1e-12) continue;
    const t = ((c[0] - a[0]) * ey - (c[1] - a[1]) * ex) / den, u = ((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / den;
    if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
  }
  ts.sort((p, q) => p - q); const out = [];
  for (let i = 0; i + 1 < ts.length; i++) { if (ts[i + 1] - ts[i] < 1e-6) continue; const m = lerp2(a, b, (ts[i] + ts[i + 1]) / 2); if (pointInPoly(m, poly)) out.push([lerp2(a, b, ts[i]), lerp2(a, b, ts[i + 1])]); }
  return out;
}
const rectPoly = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const circlePoly = (c, r, n = 40, rot = 0) => Array.from({ length: n }, (_, i) => [c[0] + Math.cos(rot + i / n * TAU) * r, c[1] + Math.sin(rot + i / n * TAU) * r]);
const regularPoly = (c, r, n, rot = 0) => circlePoly(c, r, n, rot);
const rotate = (pts, ang, c = [0, 0]) => { const ca = Math.cos(ang), sa = Math.sin(ang); return pts.map((p) => [c[0] + (p[0] - c[0]) * ca - (p[1] - c[1]) * sa, c[1] + (p[0] - c[0]) * sa + (p[1] - c[1]) * ca]); };
// a hanging cable between a and b: catenary-ish parabola with `sag` mm of drop at the middle; n points
function catenary(a, b, sag, n = 24) { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t) * (1 + 0.12 * (0.5 - t) * (0.5 - t) * 8)]); } return pts; }
function resamplePath(pts, step) {
  const out = [pts[0].slice()]; let need = step;
  for (let i = 1; i < pts.length; i++) { let x0 = pts[i - 1][0], y0 = pts[i - 1][1]; const x1 = pts[i][0], y1 = pts[i][1]; let d = Math.hypot(x1 - x0, y1 - y0); while (d >= need && d > 0) { const t = need / d; x0 += (x1 - x0) * t; y0 += (y1 - y0) * t; out.push([x0, y0]); d = Math.hypot(x1 - x0, y1 - y0); need = step; } need -= d; }
  return out;
}
const geom = { area, centroid, bbox, pointInPoly, offsetPoly, clipLine, rectPoly, circlePoly, regularPoly, rotate, catenary, resamplePath, lerp: lerp2, signedArea };

// ---------------------------------------------------------------- projection helpers
const persp = {}; Object.assign(persp, {
  // one-point perspective: vp = vanishing point; proj(x,y,z): z = depth (0 at the picture plane), f = focal length in mm
  onePoint(vp, f = 100) { return (x, y, z = 0) => { const k = f / (f + z); return [vp[0] + (x - vp[0]) * k, vp[1] + (y - vp[1]) * k]; }; },
  // intersection of line a1-a2 with line b1-b2 (null if parallel)
  intersect(a1, a2, b1, b2) { const d = (a2[0] - a1[0]) * (b2[1] - b1[1]) - (a2[1] - a1[1]) * (b2[0] - b1[0]); if (Math.abs(d) < 1e-9) return null; const t = ((b1[0] - a1[0]) * (b2[1] - b1[1]) - (b1[1] - a1[1]) * (b2[0] - b1[0])) / d; return [a1[0] + (a2[0] - a1[0]) * t, a1[1] + (a2[1] - a1[1]) * t]; },
  // a receding face: the vertical edge top→bottom (T, B) recedes toward vp; the far vertical edge sits at x = xFar. Returns [T, Tfar, Bfar, B].
  face(T, B, vp, xFar) { const tf = persp.intersect(T, vp, [xFar, 0], [xFar, 1]), bf = persp.intersect(B, vp, [xFar, 0], [xFar, 1]); return [T, tf, bf, B]; },
  // isometric (or dimetric): x,y on the ground plane, z up; returns screen [X,Y] scaled
  iso(scale = 1, ang = Math.PI / 6) { const c = Math.cos(ang), s = Math.sin(ang); return (x, y, z = 0) => [(x - y) * c * scale, (x + y) * s * scale - z * scale]; },
  toward(vp, p, t) { return lerp2(p, vp, t); },
  // n lines fanning from a vanishing point through points along a segment (e.g. rails, girders)
  fan(vp, a, b, n) { return Array.from({ length: n }, (_, i) => { const p = lerp2(a, b, n === 1 ? 0.5 : i / (n - 1)); return [p, vp]; }); },
});

// ---------------------------------------------------------------- tool methods
function install(Tool) {
  const P = Tool.prototype;
  const rr = (T) => T.S.R;

  // ruled rectangle with the corners not quite meeting; o.double draws a second line inset by o.gap
  P.frame = function (x, y, w, h, o = {}) {
    const R = rr(this), ov = o.overshoot ?? 1; const lines = [[[x, y], [x + w, y]], [[x + w, y], [x + w, y + h]], [[x + w, y + h], [x, y + h]], [[x, y + h], [x, y]]];
    const order = R() < 0.5 ? [0, 1, 2, 3] : [3, 0, 1, 2];
    for (const i of order) { const [a, b] = lines[i]; this.ruled(a, b, { overshoot: ov, ...o.line }); }
    if (o.double) { const g = o.gap ?? 1.4; this.frame(x + g, y + g, w - 2 * g, h - 2 * g, { ...o, double: false }); }
  };
  // n ruled parallel lines from a-b, spaced `gap` along the normal (positive side); returns the segments
  P.parallel = function (a, b, n, gap, o = {}) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, segs = [];
    let off = 0, w = 0; const R = rr(this);
    for (let i = 0; i < n; i++) { const p = [a[0] + nx * off, a[1] + ny * off], q = [b[0] + nx * off, b[1] + ny * off]; segs.push([p, q]); this.ruled(p, q, o.line || {}); w = 0.8 * w + R.gauss(0, 0.04); off += gap * (1 + (o.drift ?? 1) * w); }
    return segs;
  };
  // chain line: long dash, gap, short dash, gap (technical drawing centre line); drifts like a hand's rhythm
  P.dashdot = function (a, b, o = {}) {
    const R = rr(this), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
    const lg = o.long ?? 9, sh = o.short ?? 1.6, gp = o.gap ?? 1.5; let s = 0, k = 0, dr = 1;
    while (s < L - 0.3) {
      const dash = k % 2 === 0 ? lg : sh; dr = clamp(0.9 * dr + 0.1 + R.gauss(0, 0.06), 0.8, 1.25);
      const e = Math.min(L, s + dash * dr); this.line([a[0] + ux * s, a[1] + uy * s], [a[0] + ux * e, a[1] + uy * e], { profile: 'even', pressure: o.pressure, ...o.line }); s = e + gp * dr * (0.85 + 0.3 * R()); k++;
    }
  };
  P.dashed = function (a, b, o = {}) {
    const R = rr(this), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L; let s = R() * 0.5;
    while (s < L - 0.3) { const d = (o.dash ?? 3) * (0.85 + 0.3 * R()), e = Math.min(L, s + d); this.line([a[0] + ux * s, a[1] + uy * s], [a[0] + ux * e, a[1] + uy * e], { profile: 'even', pressure: o.pressure }); s = e + (o.gap ?? 1.4) * (0.8 + 0.4 * R()); }
  };
  // row of n rivets/bolts along a-b: small circles (o.mode 'circle'), dots ('dot') or crosses ('cross')
  P.rivets = function (a, b, n, o = {}) {
    const R = rr(this), r = o.r ?? 0.7, mode = o.mode || 'circle'; let w = 0;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1); w = 0.7 * w + R.gauss(0, 0.05); const p = [a[0] + (b[0] - a[0]) * t + R.gauss(0, 0.06) + w, a[1] + (b[1] - a[1]) * t + R.gauss(0, 0.06) - w];
      if (mode === 'dot') this.dot(p, { size: r * 1.6, pressure: o.pressure }); else if (mode === 'cross') { this.line([p[0] - r, p[1]], [p[0] + r, p[1]], { smooth: 0.1 }); this.line([p[0], p[1] - r], [p[0], p[1] + r], { smooth: 0.1 }); } else this.circle(p, r * (0.9 + 0.2 * R()), { smooth: 0.1, pressure: o.pressure });
    }
  };
  // vent grille: frame + n slats (ruled), optionally slanted
  P.louvre = function (x, y, w, h, n, o = {}) {
    if (o.frame !== false) this.frame(x, y, w, h, { overshoot: 0.6 });
    const slant = o.slant ?? 0, pad = o.pad ?? Math.min(w, h) * 0.12; let wv = 0; const R = rr(this);
    for (let i = 0; i < n; i++) { const yy = y + pad + (h - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1)); wv = 0.8 * wv + R.gauss(0, 0.03); this.ruled([x + pad, yy + wv], [x + w - pad, yy + slant + wv], { overshoot: 0.5 }); }
  };
  // hexagonal cell centred c with circumradius R; pointy-top by default (o.flat for flat-top); ruled corners; returns vertices
  P.hexCell = function (c, Rr, o = {}) {
    const rot = o.flat ? 0 : Math.PI / 6, verts = Array.from({ length: 6 }, (_, i) => [c[0] + Math.cos(rot + i * Math.PI / 3) * Rr, c[1] + Math.sin(rot + i * Math.PI / 3) * Rr]);
    if (o.draw !== false) { if (o.ruled === false) this.poly(verts, true, o.line || {}); else this.ruledPoly(verts, true, o.line || {}); }
    return verts;
  };
  // instrument dial: ring(s), ticks over an arc, needle, hub. o: {a0,a1 (rad, default -225°..45° clockwise sweep), major, minor, r2 (inner ring),
  // needle (0..1 along the sweep), tickLen, hub}
  P.dial = function (c, r, o = {}) {
    const R = rr(this), a0 = o.a0 ?? -Math.PI * 1.25, a1 = o.a1 ?? Math.PI * 0.25, major = o.major ?? 6, minor = o.minor ?? 4;
    this.circle(c, r, o.ring || {});
    if (o.r2) this.circle(c, r * o.r2, { smooth: 0.15 });
    const rin = r * (o.tickIn ?? 0.78), tl = o.tickLen ?? r * 0.13;
    for (let i = 0; i <= major; i++) {
      const th = a0 + (a1 - a0) * i / major, ca = Math.cos(th), sa = Math.sin(th);
      this.line([c[0] + ca * (rin - tl * 0.6), c[1] + sa * (rin - tl * 0.6)], [c[0] + ca * (rin + tl * 0.5), c[1] + sa * (rin + tl * 0.5)], { smooth: 0.08, tremor: 0.4 });
      if (i < major) for (let j = 1; j < minor; j++) { const t2 = a0 + (a1 - a0) * (i + j / minor) / major; this.line([c[0] + Math.cos(t2) * rin, c[1] + Math.sin(t2) * rin], [c[0] + Math.cos(t2) * (rin + tl * 0.4), c[1] + Math.sin(t2) * (rin + tl * 0.4)], { smooth: 0.08, tremor: 0.3 }); }
    }
    const nt = o.needle ?? R();
    if (nt >= 0) { const th = a0 + (a1 - a0) * nt; this.line([c[0] - Math.cos(th) * r * 0.12, c[1] - Math.sin(th) * r * 0.12], [c[0] + Math.cos(th) * r * 0.74, c[1] + Math.sin(th) * r * 0.74], { smooth: 0.1, tremor: 0.4, profile: 'even' }); }
    if (o.hub !== false) this.dot(c, { size: o.hubSize ?? Math.max(1, r * 0.09 / 0.3) });
  };
  // cel-highlight sparkle: tapered arms from a small bright centre. o: {points 4|8, long (arm ratio for the main axes), pressure}
  P.sparkle = function (c, size, o = {}) {
    const R = rr(this), pts = o.points ?? 4, rot = o.rot ?? R.gauss(0, 0.05);
    for (let i = 0; i < pts / 2; i++) {
      const th = rot + i * Math.PI / (pts / 2), main = i % (pts / 4 || 1) === 0 && (pts === 4 ? true : i % 2 === 0), s = size * (main ? 1 : 0.55) * (1 + R.gauss(0, 0.04));
      this.stroke([[c[0] - Math.cos(th) * s, c[1] - Math.sin(th) * s], [c[0], c[1]], [c[0] + Math.cos(th) * s * (0.95 + 0.1 * R()), c[1] + Math.sin(th) * s * (0.95 + 0.1 * R())]], { profile: 'swell', smooth: 0.06, tremor: 0.25, pressure: o.pressure ?? this.med.p0 * 1.1, exact: true });
    }
    if (o.dot !== false) this.dot(c, { size: o.dotSize ?? 0.9 });
  };
  // hanging cable a→b with sag mm; a stroke through the catenary points
  P.cable = function (a, b, o = {}) {
    const R = rr(this), sag = (o.sag ?? Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.03) * (1 + (o.slack ?? 0.15) * R.gauss(0, 1));
    const n = Math.max(6, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6));
    return this.stroke(catenary(a, b, Math.max(0.05, sag), n), { smooth: 0.4, tremor: 0.5, profile: o.profile || 'even', pressure: o.pressure, ...o.line });
  };
  // Cauliflower outline of a cluster of circles [{c:[x,y], r}] (later ones sit in front of earlier ones). The SILHOUETTE (parts of a
  // circle inside no other circle) is drawn as separate arcs that overshoot or stop short of each other a little; where a circle sits
  // in front of older ones its front edge is drawn only now and then (o.interior, default 0.3) — that is what makes it read as a
  // cauliflower rather than a coil of rings. o.clip(p) → false hides a point.
  P.puffs = function (circles, o = {}) {
    const R = rr(this), n = circles.length, interior = o.interior ?? 0.3;
    for (let i = 0; i < n; i++) {
      const ci = circles[i], da = Math.min(0.22, 0.45 / Math.max(0.5, ci.r)), steps = Math.ceil(TAU / da), th0 = R() * TAU;
      const near = []; for (let j = 0; j < n; j++) if (j !== i) { const cj = circles[j]; if (Math.hypot(ci.c[0] - cj.c[0], ci.c[1] - cj.c[1]) < ci.r + cj.r) near.push([j, cj]); }
      const runs = []; let run = null, kind = 0;
      for (let q = 0; q <= steps; q++) {
        const th = th0 + q * da, p = [ci.c[0] + Math.cos(th) * ci.r, ci.c[1] + Math.sin(th) * ci.r]; let inAny = false, inLater = false;
        for (let m = 0; m < near.length; m++) { const [j, cj] = near[m]; if (Math.hypot(p[0] - cj.c[0], p[1] - cj.c[1]) < cj.r - 0.04) { inAny = true; if (j > i) { inLater = true; break; } } }
        const k = o.clip && !o.clip(p) ? 0 : !inAny ? 1 : !inLater ? 2 : 0; // 1 silhouette, 2 front edge over an older puff, 0 hidden
        if (k && (!run || kind !== k)) { run = []; kind = k; runs.push({ k, pts: run }); }
        if (k) run.push([p[0], p[1], th]); else run = null;
      }
      const useRuns = runs.filter((r) => r.pts.length >= 3 && (r.k === 1 || (ci.r > 1.0 && R() < interior)));
      for (const rn of useRuns) {
        const arc = rn.pts.map((p) => [p[0], p[1]]);
        const last = rn.pts[rn.pts.length - 1], prev = rn.pts[rn.pts.length - 2], sg = Math.sign(last[2] - prev[2]) || 1, ex = (o.overshoot ?? 1) * 0.12;
        arc.push([last[0] - Math.sin(last[2]) * sg * R.gauss(0.05, ex), last[1] + Math.cos(last[2]) * sg * R.gauss(0.05, ex)]);
        this.stroke(arc, { smooth: Math.min(0.3, ci.r * 0.1), profile: o.profile, pressure: rn.k === 2 ? (o.pressure ?? this.med.p0) * 0.85 : o.pressure, tremor: o.tremor, speed: o.speed });
      }
      if (o.crease && R() < o.crease && ci.r > 1.2) { // a short curved interior line where two lobes meet
        const th = R() * TAU, r1 = ci.r * (0.35 + 0.3 * R()), a = [ci.c[0] + Math.cos(th) * r1, ci.c[1] + Math.sin(th) * r1], b = [ci.c[0] + Math.cos(th + 0.9) * r1 * 0.6, ci.c[1] + Math.sin(th + 0.9) * r1 * 0.6];
        this.stroke([a, [(a[0] + b[0]) / 2 + R.gauss(0, 0.15), (a[1] + b[1]) / 2 + R.gauss(0, 0.15)], b], { pressure: (o.pressure ?? this.med.p0) * 0.7, tremor: o.tremor });
      }
    }
  };
  // Honeycomb: cols × rows hex cells of circumradius Rr from `origin` (centre of the first cell), every shared edge drawn ONCE (ruled).
  // o: {flat, skip:(col,row)=>bool, cell:(centre,col,row)=>void}. Returns the cell centres.
  P.hexGrid = function (origin, cols, rows, Rr, o = {}) {
    const R = rr(this), flat = !!o.flat, w = flat ? 1.5 * Rr : Math.sqrt(3) * Rr, h = flat ? Math.sqrt(3) * Rr : 1.5 * Rr, rot0 = flat ? 0 : Math.PI / 6;
    const key = (p) => Math.round(p[0] * 20) + ',' + Math.round(p[1] * 20), edges = new Map(), centres = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (o.skip && o.skip(c, r)) continue;
      const cx = origin[0] + c * w + (flat ? 0 : (r % 2) * w / 2), cy = origin[1] + r * h + (flat ? (c % 2) * h / 2 : 0), ctr = [cx, cy]; centres.push({ c: ctr, col: c, row: r });
      const v = Array.from({ length: 6 }, (_, i) => [cx + Math.cos(rot0 + i * Math.PI / 3) * Rr, cy + Math.sin(rot0 + i * Math.PI / 3) * Rr]);
      for (let i = 0; i < 6; i++) { const a = v[i], b = v[(i + 1) % 6], ka = key(a), kb = key(b), k = ka < kb ? ka + '|' + kb : kb + '|' + ka; if (!edges.has(k)) edges.set(k, [a, b]); }
      if (o.cell) o.cell(ctr, c, r);
    }
    const list = [...edges.values()].sort((p, q) => (p[0][1] + p[1][1]) - (q[0][1] + q[1][1]) + R.gauss(0, 2)); // roughly row by row, like a hand working down the page
    for (const [a, b] of list) { const fl = R() < 0.5; this.ruled(fl ? a : b, fl ? b : a, { overshoot: 0.6, ...(o.line || {}) }); }
    return centres;
  };
  // A smoke/vapour trail of cauliflower puffs along `path` (mm points): radius runs r0 → r1 (numbers or a function of t 0..1), puffs spaced
  // about `pitch` × radius apart, wandering sideways; `lobes` satellite lobes per puff. The source end (t = 0) is drawn in front.
  // Returns the circles used (so a sheet can hatch shadow sides). o: {r0,r1,pitch,wobble,lobes,jitter,order,crease}
  P.puffChain = function (path, o = {}) {
    const R = rr(this), pts = path.length > 2 ? path : path.length === 2 ? [path[0], path[1]] : path;
    const total = resamplePath(pts, 0.5).length * 0.5, rfn = typeof o.r === 'function' ? o.r : (t) => (o.r0 ?? 1.2) + ((o.r1 ?? 4) - (o.r0 ?? 1.2)) * (o.ease === 'out' ? 1 - (1 - t) * (1 - t) : t);
    const rs = resamplePath(pts, 0.25); const cum = [0]; for (let i = 1; i < rs.length; i++) cum.push(cum[i - 1] + Math.hypot(rs[i][0] - rs[i - 1][0], rs[i][1] - rs[i - 1][1]));
    const L = cum[cum.length - 1] || 1; const circles = []; let s = 0, side = 0;
    const at = (d) => { let k = 1; while (k < cum.length - 1 && cum[k] < d) k++; const t = (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); const p = lerp2(rs[k - 1], rs[k], clamp(t)); const q = lerp2(rs[Math.max(0, k - 2)], rs[Math.min(rs.length - 1, k + 1)], 0.5); return { p, tan: (() => { const a = rs[Math.max(0, k - 2)], b = rs[Math.min(rs.length - 1, k + 1)]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; })() }; };
    while (s <= L) {
      const t = s / L, r = rfn(t) * (1 + R.gauss(0, o.jitter ?? 0.1)), { p, tan } = at(s);
      side = 0.75 * side + R.gauss(0, o.wobble ?? 0.25); const off = side * r;
      const c = [p[0] - tan[1] * off, p[1] + tan[0] * off];
      circles.push({ c, r: Math.max(0.35, r), t });
      const lobes = o.lobes ?? 2;
      for (let k = 0; k < lobes; k++) { const th = R() * TAU, d = r * (0.45 + 0.25 * R()), rl = r * (0.42 + 0.22 * R()); circles.push({ c: [c[0] + Math.cos(th) * d, c[1] + Math.sin(th) * d], r: Math.max(0.3, rl), t, sat: true }); }
      s += Math.max(0.25, r * (o.pitch ?? 0.62));
    }
    // draw older (larger t) first, the source end in front — unless o.order === 'old-on-top'
    const ordered = o.order === 'old-on-top' ? circles : circles.slice().reverse();
    // keep each puff's satellites just behind its own body so its silhouette reads as one scalloped mass
    this.puffs(ordered, o);
    return circles;
  };
}

module.exports = { install, geom, persp };
