'use strict';
// media.js — the physics of each tool: footprint, deposit rule, how it composites, how the hand drives it.
const { clamp, smooth, hexToRgb, rng, wander } = require('./util');

const NAMED = {
  blue: [24, 52, 150], black: [24, 24, 28], red: [200, 42, 36], white: [246, 245, 238], gold: [204, 168, 84], silver: [200, 204, 210],
  green: [40, 128, 76], orange: [238, 128, 30], yellow: [244, 206, 60], grey: [110, 112, 112], cyan: [30, 150, 190],
};
const col = (c, dflt) => (c === undefined ? dflt : NAMED[c] ? NAMED[c] : hexToRgb(c));
// absorbance for a translucent ink: transmittance = colour / 255 (floored)
const absorb = (c, strength = 1) => c.map((v) => -Math.log(Math.max(0.035, v / 255)) * strength);

const GRADES = {
  HB: { r0: 0.17, opac: 0.74, col: [78, 78, 84], reachB: 0.30, reachK: 0.90, sheen: 0.20, fillRate: 38 },
  '2B': { r0: 0.20, opac: 0.84, col: [62, 62, 68], reachB: 0.32, reachK: 0.92, sheen: 0.22, fillRate: 44 },
  '4B': { r0: 0.26, opac: 0.92, col: [46, 46, 52], reachB: 0.34, reachK: 0.94, sheen: 0.24, fillRate: 52 },
  '6B': { r0: 0.32, opac: 0.97, col: [36, 36, 42], reachB: 0.36, reachK: 0.96, sheen: 0.26, fillRate: 60 },
};

// Contact model for dry media: the paper's height h (0 pit .. 1 crest) against how far the tip reaches into the tooth.
// Light pressure touches only the crests (grain shows); pressure fills the valleys. `film` is a smooth underlayer that
// does not depend on the tooth (graphite smears a little); `ft` is how much of that film still notices the tooth.
function contactAmount(P) {
  const { reachB, reachK, edgeReach, soft, film = 0, ft = 1, dep = 1 } = P;
  return (p, d, r, v, s, h, fl) => {
    let cov = r + 0.5 - d; if (cov <= 0) return 0; if (cov > 1) cov = 1;
    const q = d / r, rch = (reachB + reachK * p) * (1 - edgeReach * (q > 1 ? 1 : q * q));
    let c = (h - (1 - rch)) / soft + 0.5; c = c < 0 ? 0 : c > 1 ? 1 : c;
    if (film) { let tt = rch > 0.02 ? (1 - ft) + ft * (h > 0.85 ? 1 : h * 1.18) : 0; tt = tt > 1 ? 1 : tt; c = film * tt + (1 - film) * c; }
    return cov * c * dep * fl;
  };
}
const normLane = (n, R, lamMin, lamMax, nw, step) => { const a = new Float32Array(n); const w = wander(R, lamMin, lamMax, nw); let m = 1e-6; for (let i = 0; i < n; i++) { a[i] = w(i * step); m = Math.max(m, Math.abs(a[i])); } for (let i = 0; i < n; i++) a[i] /= m; return a; };

function make(S, kind, o = {}) {
  const depth = S.depth;
  const M = { kind, mode: 'sweep', p0: 0.5, rp0: 0.85, rp1: 0.3, smooth: 0.35, tremor: 1, dry: false, flowKind: 'none', wearRate: 0, sheen: 0, fillRate: 0, opac: 1, opts: o };
  switch (kind) {
    case 'graphite': {
      const g = GRADES[o.grade || 'HB'] || GRADES.HB;
      Object.assign(M, { comp: 0, dry: true, r0: g.r0, opac: g.opac, col: g.col, sheen: g.sheen, sheenCol: [128, 132, 142], fillRate: g.fillRate, fillCap: 0.84, wearRate: 0.00035, p0: 0.45, rp0: 0.72, rp1: 0.55, tremor: 1.0 });
      M.amount = contactAmount({ reachB: g.reachB, reachK: g.reachK, edgeReach: 0.32, soft: 0.4, film: 0.34, ft: 0.9 });
      if (o.side) { M.mode = 'stamp'; M.nibW = o.sideWidth || 5.5; M.nibH = 0.9; M.r0 = g.r0; M.p0 = 0.32; M.opac *= 0.8; M.wick = 1.8; M.amount = contactAmount({ reachB: 0.05, reachK: 1.15, edgeReach: 0.5, soft: 0.3, film: 0.28, ft: 0.9 }); }
      break;
    }
    case 'pencil': case 'colerase': case 'pastelpencil': {
      const isCE = kind === 'colerase', isPP = kind === 'pastelpencil';
      const c = col(o.color, isCE ? [60, 110, 200] : [60, 60, 60]);
      const point = o.point === 'blunt' ? 1.6 : 1;
      const lighten = (k) => c.map((v) => Math.min(255, v + (255 - v) * k));
      Object.assign(M, { comp: isPP ? 2 : 0, dry: true, r0: (isCE ? 0.3 : isPP ? 0.45 : 0.22) * point, opac: isPP ? 0.92 : isCE ? 0.66 : 0.86, col: c, fillRate: isPP ? 50 : isCE ? 26 : 30, fillCap: isPP ? 0.7 : 0.58, sheen: isPP ? 0 : 0.14, sheenCol: lighten(0.38), wearRate: 0.0004, p0: 0.5, rp0: 0.75, rp1: 0.5 });
      M.amount = contactAmount(isPP ? { reachB: 0.08, reachK: 1.0, edgeReach: 0.6, soft: 0.28, film: 0.2, ft: 0.8 } : isCE ? { reachB: 0.24, reachK: 0.95, edgeReach: 0.5, soft: 0.3, film: 0.22, ft: 0.8 } : { reachB: 0.28, reachK: 0.95, edgeReach: 0.45, soft: 0.3, film: 0.3, ft: 0.8 });
      if (o.side) { M.mode = 'stamp'; M.nibW = o.sideWidth || 4.4; M.nibH = 1.1; M.p0 = 0.34; M.wick = 1.8; M.amount = contactAmount({ reachB: 0.05, reachK: 1.1, edgeReach: 0.55, soft: 0.3, film: 0.25, ft: 0.9 }); }
      break;
    }
    case 'ballpoint': {
      const c = col(o.color, NAMED.blue);
      Object.assign(M, { comp: 1, r0: 0.18, k: absorb(c, 1.0), p0: 0.55, rp0: 0.9, rp1: 0.22, smooth: 0.3, tremor: 0.9, flowKind: 'ballpoint', pvar: 0.4 });
      M.amount = (p, d, r, v, s, h, fl) => {
        const cv = r + 0.5 - d + (h - 0.5) * 0.9; if (cv <= 0) return 0;
        const q = d / r;
        let a = (cv > 1 ? 1 : cv) * fl * (0.22 + 0.98 * p) * (0.86 + 0.24 * q * q);
        a *= 1 - 0.5 * Math.max(0, 0.62 - p) * (1 - h) * 1.6;
        return a;
      };
      break;
    }
    case 'fineliner': {
      const c = col(o.color, NAMED.black); const nib = o.nib || 0.3;
      Object.assign(M, { comp: 1, r0: nib / 2, k: absorb(c, 1.05), p0: 0.6, rp0: 0.97, rp1: 0.06, smooth: 0.25, tremor: 0.7, flowKind: o.kind === 'technical' ? 'technical' : 'felt', swell: true });
      const soft = o.kind === 'technical' ? 0.6 : 1.5;
      M.pvar = 0.06;
      M.amount = (p, d, r, v, s, h, fl) => {
        const cv = (r + soft * 0.62 - d + (h - 0.5) * (o.kind === 'technical' ? 0.85 : 1.9)) / soft; if (cv <= 0) return 0;
        return (cv > 1 ? 1 : cv) * fl * (0.86 + 0.14 * p) * (1 - 0.1 * (1 - h) * (1 - p));
      };
      break;
    }
    case 'gel': {
      const c = col(o.color, NAMED.white); const nib = o.nib || 0.7;
      Object.assign(M, { comp: 2, r0: nib / 2, col: c, opac: 0.985, p0: 0.6, rp0: 0.95, rp1: 0.1, smooth: 0.3, tremor: 0.8, flowKind: 'gel', pvar: 0.2, fillRate: 0 });
      const lane = normLane(512, rng('gel:' + (o.color || '') + nib), 1.5, 40, 4, 0.1);
      M.lane = lane; M.laneShift = 0;
      // opaque gel: solid where the ball rolled, a hair of the paper's pits left dry at the rim and where the flow thins; the edge is
      // a fraction dimmer on one side where the bead dries lower
      M.amount = (p, d, r, v, s, h, fl) => {
        let cv = r + 0.5 - d + (h - 0.5) * 0.7; if (cv <= 0) return 0; cv = cv > 1 ? 1 : cv;
        const q = d / r, reach = 1.02 - 0.28 * q * q - 0.35 * Math.max(0, 0.55 - p);
        let c = (h - (1 - reach)) / 0.1 + 0.5; c = c < 0 ? 0 : c > 1 ? 1 : c;
        const ln = lane[((((v * 0.5 + 0.5) * 60 + M.laneShift + s * 0.03) | 0) % 512 + 512) % 512];
        const side = 1 - 0.07 * (v > 0.35 ? (v - 0.35) / 0.65 : 0);
        return cv * c * (fl > 1 ? 1 : fl) * side * (0.93 + 0.07 * ln) * (0.9 + 0.1 * p);
      };
      break;
    }
    case 'marker': {
      const c = col(o.color, NAMED.black); const tip = o.tip || 'chisel', width = o.width || (tip === 'chisel' ? 4 : 1.2);
      Object.assign(M, { comp: 1, k: absorb(c, (c[0] + c[1] + c[2]) < 160 ? 1.5 : 1.0), p0: 0.6, smooth: 0.5, tremor: 1.1, flowKind: 'marker', lanes: true });
      if (tip === 'chisel') { M.mode = 'stamp'; M.nibW = width; M.nibH = Math.max(0.5, width * 0.17); M.nibAng = (o.angle ?? 40) * Math.PI / 180; M.r0 = width / 2; M.rp0 = 1; M.rp1 = 0; M.wick = 2.4; M.nibRot = 0.05; }
      else { M.r0 = width / 2; M.rp0 = 0.95; M.rp1 = 0.1; }
      const Rl = rng('lane:' + (o.color || '') + width);
      const laneC = normLane(512, Rl, 2, 60, 5, 0.12), laneF = normLane(512, Rl, 0.4, 5, 4, 0.05);
      M.lane = laneC; M.laneShift = 0;
      // felt marker: streak lanes (coarse + fine) along the stroke, wet rim darker at both edges, ends pool, fast or starved strokes
      // leave dry lanes, edges bleed a little along the fibres
      M.amount = (p, d, r, v, s, h, fl, i, wv) => {
        const av = v < 0 ? -v : v; if (av > 1.04) return 0;
        const idx = ((v * 0.5 + 0.5) * 300 + M.laneShift + s * 0.04) | 0, m = ((idx % 512) + 512) % 512;
        const lc = laneC[m], lf = laneF[(m * 3 + (M.laneShift >> 2)) % 512];
        const rim = 1 + 0.42 * smooth(0.6, 1.0, av);
        const L = M.L || 1e9;
        const ends = 1 + 0.42 * Math.exp(-s / 10) + 0.55 * Math.exp(-(L - s) / 8);
        const speed = 0.8 + 0.2 * p;
        const starve = smooth(0.25, 0.85, -lf * (0.45 + 2.6 * (1 - fl)) - 0.3 + 0.35 * (1 - p));
        let a = 0.7 * (0.82 + 0.3 * lc + 0.14 * lf) * rim * ends * speed * fl * (1 - 0.8 * starve);
        a *= 1 - 0.28 * (1 - h) * (1 - p);
        if (av > 0.9) a *= 0.84 + 0.32 * h > 1 ? 1 : 0.84 + 0.32 * h; // bleeding edge follows the fibres
        return a;
      };
      break;
    }
    case 'crayon': {
      const wax = o.kind === 'wax', c = col(o.color, [200, 60, 40]);
      Object.assign(M, { comp: 2, dry: true, r0: wax ? 1.7 : 2.2, col: c, opac: wax ? 0.85 : 0.94, fillRate: wax ? 34 : 46, p0: 0.55, rp0: 0.7, rp1: 0.5, smooth: 0.8, tremor: 1.4, wearRate: 0.0006, pvar: 0.25 });
      const lane = new Float32Array(512); { const R = rng('cray:' + (o.color || '') + (o.kind || '')); const w = wander(R, 2, 70, 5); for (let i = 0; i < 512; i++) lane[i] = w(i * 0.2); }
      M.lane = lane; M.laneShift = 0;
      M.amount = (p, d, r, v, s, h, fl) => {
        const q = d / r; const e = 1 - q * q * q; if (e <= 0) return 0;
        const ln = lane[((((v * 0.5 + 0.5) * 90 + M.laneShift + s * 0.02) | 0) % 512 + 512) % 512];
        const load = p * Math.sqrt(e) * (0.86 + 0.34 * ln), need = 1.4 * depth * (1 - h);
        const a = (load * 1.9 - need) / 0.42; if (a <= 0) return 0;
        return (a > 1 ? 1 : a) * Math.pow(e, 0.15);
      };
      break;
    }
    default: throw new Error('unknown tool kind ' + kind);
  }
  M.rp = (p) => M.rp0 + M.rp1 * p;
  return M;
}

module.exports = { make, NAMED, col };
