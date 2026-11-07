'use strict';
const TAU = Math.PI * 2;

function ell(cx, cy, rx, ry = rx, rot = 0, n = 72) {
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) { const t = (i / n) * TAU, x = Math.cos(t) * rx, y = Math.sin(t) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return out;
}
function rrect(x0, y0, x1, y1, r, n = 8) {
  r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2); const out = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * Math.PI / 2; out.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2); corner(x1 - r, y1 - r, 0); corner(x0 + r, y1 - r, Math.PI / 2); corner(x0 + r, y0 + r, Math.PI);
  return out;
}
function curve(c, closed = true, step = 0.5) {
  const n = c.length, out = [], last = closed ? n : n - 1;
  const P = (i) => (closed ? c[(i + n) % n] : c[Math.max(0, Math.min(n - 1, i))]);
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const m = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  if (!closed) out.push(c[n - 1].slice());
  return out;
}
const tf = (pts, { x = 0, y = 0, rot = 0, s = 1, sx = 1 } = {}) => {
  const c = Math.cos(rot), si = Math.sin(rot);
  return pts.map((p) => { const px = p[0] * s * sx, py = p[1] * s; return [x + px * c - py * si, y + px * si + py * c]; });
};
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function resample(p, step) {
  const out = [p[0].slice()]; let need = step;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]); let t = need;
    while (t <= d) { out.push(lerp2(a, b, t / d)); t += step; }
    need = t - d;
  }
  const last = p[p.length - 1]; if (Math.hypot(last[0] - out[out.length - 1][0], last[1] - out[out.length - 1][1]) > step * 0.2) out.push(last.slice());
  return out;
}
function trim(p, d0, d1) {
  const L = polyLen(p), out = []; let s = 0;
  const at = (dist) => { let acc = 0; for (let i = 1; i < p.length; i++) { const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + seg >= dist) return [i, lerp2(p[i - 1], p[i], (dist - acc) / (seg || 1))]; acc += seg; } return [p.length - 1, p[p.length - 1]]; };
  const [i0, a] = at(d0), [i1, b] = at(Math.max(d0, L - d1));
  out.push(a); for (let i = i0; i < i1; i++) out.push(p[i]); out.push(b);
  return out;
}

module.exports = { ell, rrect, curve, tf, polyLen, resample, trim };
