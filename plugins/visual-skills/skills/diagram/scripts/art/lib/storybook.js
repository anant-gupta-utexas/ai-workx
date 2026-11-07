'use strict';
const classic = require('./classic');
const D = require('./draw');
const Lt = require('./letter');

const INK = '#1d1a1e';
const SOFT = {
  sky: '#c6dfec', leaf: '#a3c78a', leafDeep: '#6f9b5d', young: '#c4dc98', butter: '#f3d78f', blush: '#f4bcc6', rose: '#e9909f',
  lilac: '#cdbde4', tea: '#a8693f', milkTea: '#dfba90', cream: '#f7ecd6', wood: '#d3a875', woodDeep: '#a97b4c', clay: '#c98a6a',
  steel: '#c3cbd0', water: '#b9d7e6', soil: '#cfae86', sugar: '#c48a54', pearl: '#3d2b26', pearlRaw: '#e4d5bd', straw: '#f2b3be', ice: '#dcecf2',
};

function plate(o) {
  const P = classic.plate({ ...o, paper: o.paper || 'cartridge' });
  P.INK = INK;
  const nibOf = (w) => Math.max(0.12, (w ?? 1.1) * 0.29);
  P.shape = (polys, o2 = {}) => {
    const fill = o2.fill ?? 'paper', m = P.paper(polys, { cut: o2.cut, clip: o2.clip });
    if (fill === 'black') P.dark(polys, { mask: m });
    else if (fill !== 'paper' && fill !== 'none') P.colour(polys, fill, { mask: m });
    if (o2.outline !== false) P.outline(polys, { mask: m, nib: nibOf(o2.w), color: INK });
    return m;
  };
  P.black = (polys, o2 = {}) => P.shape(polys, { ...o2, fill: 'black' });
  P.dark = (polys, o2 = {}) => {
    const m = o2.mask || P.paper(polys, o2);
    P.colour(polys, '#4a4246', { mask: m, pressure: 0.6, passes: 1 });
    P.hatch(polys, { mask: m, angle: 35, pitch: 0.42, nib: 0.14, cross: 1, color: INK });
    return m;
  };
  P.splash = (polys, color, o2 = {}) => P.colour(polys, color, { cut: o2.cut, clip: o2.clip, pressure: o2.pressure ?? 0.6, passes: o2.passes ?? 2 });
  P.line = (pts, o2 = {}) => P.ink(pts, { nib: nibOf(o2.w ?? 1.0), color: o2.color });
  P.loop = (pts, o2 = {}) => P.outline([pts], { nib: nibOf(o2.w ?? 1.1) });
  P.keepOut = () => {};
  P.keepOutPoly = () => {};
  P.label = (t, x, y, o2 = {}) => Lt.write(P.S, t, x, y, { face: 'serif-bold', size: o2.size ?? 3, align: 'center', color: INK, ...o2 });
  P.shadow = (cx, cy, rx, ry) => P.hatch([D.ell(cx, cy, rx, ry)], { angle: 0, pitch: 0.55, nib: 0.11, color: '#5a5258' });
  return P;
}

module.exports = { plate, SOFT, INK };
