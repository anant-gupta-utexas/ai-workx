'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../kit');
const MK = require('./mask');
const D = require('./draw');
const Lt = require('./letter');
const { rng } = require('../kit/util');

const INK = '#191512';

function plate(o) {
  const S = K.sheet({ id: o.id, w: o.w, h: o.h, ppm: o.ppm, paper: o.paper || 'cream', seed: o.seed });
  const R = rng('classic:' + o.seed);
  const pens = new Map();
  const pen = (nib = 0.3, color = INK) => { const k = nib + color; if (!pens.has(k)) pens.set(k, S.tool('fineliner', { nib, color, kind: 'technical' })); return pens.get(k); };
  const rectOf = (r) => [[r.x0 - 1.5, r.y0 - 1.5], [r.x1 + 1.5, r.y0 - 1.5], [r.x1 + 1.5, r.y1 + 1.5], [r.x0 - 1.5, r.y1 + 1.5]];
  const maskOf = (polys, o2 = {}) => {
    const m = MK.maskOf(S, polys);
    if (o2.cut) MK.subtract(S, m, o2.cut);
    if (o2.clip) { const c = MK.maskOf(S, o2.clip); for (let i = 0; i < m.length; i++) m[i] &= c[i]; }
    return m;
  };
  const P = { S, R, w: o.w, h: o.h, INK, pen };

  P.ink = (pts, o2 = {}) => {
    const p = D.resample(pts, 0.6).map(([x, y]) => [x + R.gauss(0, 0.02), y + R.gauss(0, 0.02)]);
    pen(o2.nib ?? 0.3, o2.color).stroke(p, { smooth: o2.smooth ?? 0.25, tremor: o2.tremor ?? 0.55, profile: o2.profile ?? 'even' });
  };
  P.curve = (ctrl, o2 = {}) => P.ink(D.curve(ctrl, false, 0.35), o2);
  P.paper = (polys, o2 = {}) => { const m = maskOf(polys, o2); MK.paint(S, m, () => {}, 9, true); return m; };
  P.outline = (polys, o2 = {}) => {
    const m = o2.mask || maskOf(polys, o2);
    if (o2.fill === 'paper') MK.paint(S, m, () => {}, 9, true);
    MK.outline(S, pen(o2.nib ?? 0.32, o2.color), m, { segLen: o2.segLen ?? 50, tremor: 0.45, smooth: 0.2 });
    return m;
  };
  P.colour = (polys, color, o2 = {}) => {
    const m = o2.mask || maskOf(polys, o2), a = o2.angle ?? 35;
    MK.paint(S, m, (r) => {
      const T = S.tool('pencil', { color, point: o2.blunt ? 'blunt' : undefined });
      T.fillWith(rectOf(r), { angle: a + R.gauss(0, 4), pressure: o2.pressure ?? 0.78 });
      if ((o2.passes ?? 2) > 1) T.fillWith(rectOf(r), { angle: a - 68 + R.gauss(0, 4), pressure: (o2.pressure ?? 0.78) * 0.85 });
      if ((o2.passes ?? 2) > 2) T.fillWith(rectOf(r), { angle: a + 50, pressure: (o2.pressure ?? 0.78) * 0.75 });
    }, 9, false);
    return m;
  };
  P.hatch = (polys, o2 = {}) => {
    const m = o2.mask || maskOf(polys, o2);
    MK.paint(S, m, (r) => {
      const T = o2.color && o2.pencil ? S.tool('pencil', { color: o2.color }) : pen(o2.nib ?? 0.13, o2.color);
      T.hatch(rectOf(r), { angle: o2.angle ?? 45, pitch: o2.pitch ?? 0.75, pressure: o2.pressure ?? 0.8, length: o2.length ?? 30, cross: o2.cross ?? 0, curve: o2.curveAmt ?? 0.01, tremor: 0.4 });
    }, 9, false);
    return m;
  };
  P.stipple = (polys, o2 = {}) => {
    const m = o2.mask || maskOf(polys, o2);
    MK.paint(S, m, (r) => pen(o2.nib ?? 0.2, o2.color).stipple(rectOf(r), { density: o2.density ?? 1.2, size: o2.size ?? 0.8, clump: o2.clump }), 9, false);
    return m;
  };
  P.dot = (x, y, r, color = INK) => { const m = maskOf([D.ell(x, y, r, r)]); MK.paint(S, m, (rr) => { const T = S.tool('pencil', { color, point: 'blunt' }); T.fillWith(rectOf(rr), { angle: 20, pressure: 0.98 }); T.fillWith(rectOf(rr), { angle: -40, pressure: 0.95 }); T.fillWith(rectOf(rr), { angle: 80, pressure: 0.9 }); }, 12, false); };
  P.text = (t, x, y, o2 = {}) => Lt.write(S, t, x, y, { face: 'serif', color: INK, ...o2 });
  P.italic = (t, x, y, o2 = {}) => Lt.write(S, t, x, y, { face: 'serif', color: INK, slant: 0.22, ...o2 });
  P.finish = async (file, o2 = {}) => {
    const canvas = S.toCanvas();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, await canvas.encode('png'));
    const { createCanvas } = require('@napi-rs/canvas');
    for (const [suffix, px, q] of o2.sizes || []) {
      const k = px / Math.max(canvas.width, canvas.height), c = createCanvas(Math.round(canvas.width * k), Math.round(canvas.height * k)), g = c.getContext('2d');
      g.imageSmoothingQuality = 'high'; g.drawImage(canvas, 0, 0, c.width, c.height);
      const f = file.replace(/\.png$/, suffix);
      fs.writeFileSync(f, f.endsWith('.png') ? await c.encode('png') : await c.encode('jpeg', q ?? 92));
    }
    return file;
  };
  return P;
}

module.exports = { plate, INK };
