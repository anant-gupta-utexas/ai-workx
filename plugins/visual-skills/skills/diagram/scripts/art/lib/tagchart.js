'use strict';
const D = require('./draw');
const Lt = require('./letter');

function tagShape(x0, y0, x1, y1, bevel) {
  const cy = (y0 + y1) / 2, b = Math.min(bevel, (y1 - y0) * 0.42);
  return [[x0 - b * 1.25, y0 + b], [x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0 - b * 1.25, y1 - b]];
}

function arrowHead(P, tip, ang, len, nib, color) {
  const wing = len * 0.42, back = len, notch = len * 0.62, c = Math.cos(ang), s = Math.sin(ang);
  const pt = (u, v) => [tip[0] - u * c + v * -s, tip[1] - u * s + v * c];
  const head = [pt(0, 0), pt(back, wing), pt(notch, 0), pt(back, -wing)];
  P.colour([head], color || P.INK, { passes: 2, pressure: 0.95 });
  P.outline([head], { nib: nib * 0.6, color });
}

function draw(P, Lin, m, o = {}) {
  let L = Lin;
  const S = P.S, k = m.k, occupied = [];
  const face = o.face || 'serif-bold', stateSize = o.stateSize ?? 16 * k * (o.textScale ?? 1), labelSize = o.labelSize ?? 14 * k * (o.labelScale ?? o.textScale ?? 1);
  const grow = (n) => { const need = Math.max(...n.lines.map((q) => Lt.measure(q.text, face, stateSize))) + stateSize * 1.4, have = n.w * k; return need > have ? (need - have) / 2 / k : 0; };
  L = { ...L, nodes: L.nodes.map((n) => { const g = grow(n), gh = Math.max(0, (stateSize * (n.lines.length * 1.18 + 0.9) - n.h * k) / 2 / k); return g || gh ? { ...n, w: n.w + 2 * g, h: n.h + 2 * gh } : n; }) };
  const nib = o.nib ?? 0.34, bevel = o.bevel ?? 3.4;
  const labelBoxes = new Map(), labelPlace = new Map();
  if (o.labelsBeside) {
    const nodeBoxes = L.nodes.map((n) => ({ x0: m.X(n.cx - n.w / 2), x1: m.X(n.cx + n.w / 2), y0: m.Y(n.cy - n.h / 2), y1: m.Y(n.cy + n.h / 2) }));
    const lf = o.labelFace || 'serif-bold', taken = nodeBoxes.map((b) => ({ x0: b.x0 - 2, x1: b.x1 + 2, y0: b.y0 - 2.4, y1: b.y1 + 1.2 })).concat(o.avoid || []);
    const paths = L.edges.map((e) => ({ id: e.id, pts: D.resample(e.pts.map(m.P), 0.8) }));
    const inBox = (b, x, y) => x > b.x0 - 0.8 && x < b.x1 + 0.8 && y > b.y0 - 0.6 && y < b.y1 + 0.6;
    const hitsPath = (b, skip) => paths.some((q) => q.id !== skip && q.pts.some(([x, y]) => inBox(b, x, y)));
    const outside = (b) => b.x0 < (o.bounds?.x0 ?? 2) || b.x1 > (o.bounds?.x1 ?? 214);
    const overlap = (b, t, g = 0) => b.x0 < t.x1 + g && b.x1 > t.x0 - g && b.y0 < t.y1 + g && b.y1 > t.y0 - g;
    const clash = (b, skip) => outside(b) || taken.some((t) => overlap(b, t)) || hitsPath(b, skip);
    const cost = (b) => {
      let c = 0;
      for (const t of taken) { const ox = Math.min(b.x1, t.x1) - Math.max(b.x0, t.x0), oy = Math.min(b.y1, t.y1) - Math.max(b.y0, t.y0); if (ox > 0 && oy > 0) c += ox * oy; }
      for (const q of paths) for (const [x, y] of q.pts) if (inBox(b, x, y)) c += 6;
      if (outside(b)) c += 1e4;
      return c;
    };
    const steps = (step, last) => { const ts = [0.5]; for (let d = step; d <= last; d += step) ts.push(0.5 - d, 0.5 + d); return ts; };
    const passes = [[[2.4, 4.2], steps(0.05, 0.46), [0.5]], [[2.4, 3.2, 4.2, 5.4], steps(0.025, 0.47), [0.5, 0.25, 0.75]]];
    for (const lb of L.labels) {
      const e = L.edges.find((q) => q.id === lb.edge), pts = D.resample(e.pts.map(m.P), 0.5);
      const w = Math.max(...lb.lines.map((q) => Lt.measure(q.text, lf, labelSize))) + labelSize * 0.25, h = lb.lines.length * labelSize * 1.22;
      const at = (t) => { const i = Math.round(t * (pts.length - 1)); return [pts[i], pts[Math.max(0, i - 2)], pts[Math.min(pts.length - 1, i + 2)]]; };
      let best, cheapest;
      search: {
        for (const [offs, ts, slides] of passes) for (const off of offs) for (const t of ts) {
          const [mid, a, c] = at(t), vertical = Math.abs(c[1] - a[1]) >= Math.abs(c[0] - a[0]);
          for (const [sx, sy] of vertical ? [[1, 0], [-1, 0]] : [[0, -1], [0, 1]]) for (const slide of slides) {
            const x0 = sx > 0 ? mid[0] + off : sx < 0 ? mid[0] - off - w : mid[0] - w * slide, y0 = sy < 0 ? mid[1] - off - h : sy > 0 ? mid[1] + off : mid[1] - h * slide;
            const b = { x0, x1: x0 + w, y0, y1: y0 + h };
            if (!clash(b)) { best = { b, side: sx, mid }; break search; }
            const cb = cost(b); if (!cheapest || cb < cheapest.c) cheapest = { b, side: sx, mid, c: cb };
          }
        }
        const ends = pts.slice(0, 7).concat(pts.slice(-7));
        for (const t of passes[1][1]) {
          const [mid] = at(t), b = { x0: mid[0] - w / 2, x1: mid[0] + w / 2, y0: mid[1] - h / 2, y1: mid[1] + h / 2 };
          if (!ends.some(([x, y]) => inBox(b, x, y)) && !clash(b, e.id)) { best = { b, side: 0, mid }; break search; }
        }
        const mid = [m.X(lb.x + lb.w / 2), m.Y(lb.y + lb.h / 2)], b = { x0: mid[0] - w / 2, x1: mid[0] + w / 2, y0: mid[1] - h / 2, y1: mid[1] + h / 2 };
        if (!outside(b) && !hitsPath(b, e.id) && !nodeBoxes.some((t) => overlap(b, t, 0.5)) && !taken.slice(nodeBoxes.length).some((t) => overlap(b, t))) best = { b, side: 0, mid };
      }
      if (!best) best = cheapest;
      taken.push({ x0: best.b.x0 - 1, x1: best.b.x1 + 1, y0: best.b.y0 - 0.6, y1: best.b.y1 + 0.6 });
      labelPlace.set(lb.edge, best);
    }
  }
  for (const lb of L.labels) {
    if (labelPlace.has(lb.edge)) continue;
    const w = Math.max(...lb.lines.map((q) => Lt.measure(q.text, o.labelFace || 'serif-bold', labelSize))) + labelSize * 0.3;
    const cx = m.X(lb.lines[0].x), top = m.Y(lb.lines[0].y) - labelSize * 0.98, bot = m.Y(lb.lines[lb.lines.length - 1].y) + labelSize * 0.3;
    labelBoxes.set(lb.edge, { x0: cx - w / 2, x1: cx + w / 2, y0: top, y1: bot });
  }

  const gaps = [...labelBoxes.values(), ...[...labelPlace.values()].map((q) => q.b)];
  for (const e of L.edges) {
    let pts = e.pts.map(m.P);
    const tip = e.marker ? m.P(e.marker[0]) : pts[pts.length - 1];
    pts = pts.concat([tip]);
    const fromStart = L.starts.some((s) => Math.hypot(s.cx - e.pts[0][0], s.cy - e.pts[0][1]) < 12);
    pts = D.trim(pts, fromStart ? 1.8 : 1.2, o.stopShort ?? 1.6);
    const g = 1.0, runs = [[]];
    for (const p of D.resample(pts, 0.3)) {
      const hit = gaps.some((b) => p[0] > b.x0 - g && p[0] < b.x1 + g && p[1] > b.y0 - g && p[1] < b.y1 + g);
      if (hit) { if (runs[runs.length - 1].length) runs.push([]); } else runs[runs.length - 1].push(p);
    }
    const src = L.nodes.find((n) => e.from === n.id), onBug = o.bugColor && e.bug;
    for (const r of runs) if (D.polyLen(r) > 0.8) { if (onBug) P.colour([D.tf(r, {}).concat(r.slice().reverse().map(([x, y]) => [x + 0.9, y + 0.9]))], o.bugWash || '#f0b3a8', { pressure: 0.7, passes: 1 }); P.ink(r, { nib: onBug ? nib * 1.6 : nib, tremor: 0.7, color: onBug ? o.bugColor : o.lineColor }); }
    const end = pts[pts.length - 1], prev = D.resample(pts, 0.5).slice(-6)[0];
    arrowHead(P, end, Math.atan2(end[1] - prev[1], end[0] - prev[0]), (o.head ?? 3.0) * (onBug ? 1.15 : 1), nib, onBug ? o.bugColor : o.lineColor);
    for (let i = 1; i < pts.length; i++) occupied.push({ seg: [pts[i - 1], pts[i]], r: 1.3, what: 'arrow ' + e.id });
  }

  for (const n of L.nodes) {
    const x0 = m.X(n.cx - n.w / 2) + bevel * 0.55, x1 = m.X(n.cx + n.w / 2), y0 = m.Y(n.cy - n.h / 2), y1 = m.Y(n.cy + n.h / 2), cy = (y0 + y1) / 2;
    if ((o.nodeStyle && o.nodeStyle(n)) === 'note' || ((o.nodeStyle && o.nodeStyle(n)) === undefined && o.style === 'note')) {
      const px0 = m.X(n.cx - n.w / 2) - 0.4, px1 = x1 + 0.4, ty0 = y0 - 0.4, ty1 = y1 + 0.4, R = P.R, tilt = R.range(-0.035, 0.035);
      const shape = D.tf([[px0, ty0], [px1, ty0], [px1, ty1], [px0, ty1]].map(([x, y]) => [x - (px0 + px1) / 2, y - cy]), { x: (px0 + px1) / 2, y: cy, rot: tilt });
      P.hatch([D.tf(shape, { x: 0.9, y: 1.1 })], { cut: [shape], angle: 45, pitch: 0.45, nib: 0.09, color: '#4d4448' });
      P.paper([shape]);
      P.colour([shape], o.noteColor || '#fbf3dc', { pressure: 0.5, passes: 1 });
      P.outline([shape], { nib: nib * 0.8 });
      for (const [tx, ty, ta] of [[px0 + 1.2, ty0 + 0.4, -0.6], [px1 - 1.2, ty0 + 0.4, 0.6]]) { const tape = D.tf(D.rrect(-2.2, -0.9, 2.2, 0.9, 0.2), { x: tx, y: ty, rot: ta + tilt }); P.paper([tape]); P.colour([tape], '#e9e1c4', { pressure: 0.5, passes: 1 }); P.outline([tape], { nib: 0.09 }); }
      const lines = n.lines.map((q) => q.text);
      Lt.block(S, lines, (px0 + px1) / 2, cy, { face, size: stateSize, color: P.INK, lineGap: 1.18 });
      occupied.push({ x0: px0 - 2, x1: px1 + 2, y0: ty0 - 1.5, y1: ty1 + 1.3, what: 'state ' + lines.join(' ') });
      continue;
    }
    if ((o.nodeStyle && o.nodeStyle(n)) === 'sign') {
      const px0 = m.X(n.cx - n.w / 2) - 0.6, px1 = x1 + 0.6, ty0 = y0, ty1 = y1 + 0.6, cx0 = (px0 + px1) / 2;
      const board = D.rrect(px0, ty0, px1, ty1, 1.2);
      P.hatch([D.tf(board, { x: 1.0, y: 1.2 })], { cut: [board], angle: 45, pitch: 0.45, nib: 0.09, color: '#4d4448' });
      P.paper([board]);
      P.colour([board], o.signColor || '#e3c08e', { pressure: 0.7, angle: 0 });
      for (let yy = ty0 + 2.6; yy < ty1 - 1; yy += 2.8) P.ink([[px0 + 1, yy + P.R.range(-0.2, 0.2)], [px1 - 1, yy + P.R.range(-0.2, 0.2)]], { nib: 0.07, color: '#8a6a45' });
      P.outline([board], { nib: nib });
      for (const [ex, ey] of [[px0 + 1.8, ty0 + 1.6], [px1 - 1.8, ty0 + 1.6], [px0 + 1.8, ty1 - 1.6], [px1 - 1.8, ty1 - 1.6]]) P.dot(ex, ey, 0.36, '#6a5a48');
      const lines = n.lines.map((q) => q.text);
      Lt.block(S, lines, cx0, cy + 0.3, { face, size: stateSize, color: P.INK, lineGap: 1.18 });
      occupied.push({ x0: px0, x1: px1 + 1, y0: ty0 - 0.5, y1: ty1 + 1.2, what: 'state ' + lines.join(' ') });
      continue;
    }
    if (o.style === 'ticket') {
      const px0 = m.X(n.cx - n.w / 2) - 0.6, px1 = x1 + 0.6, ty0 = y0 - 0.6, ty1 = y1 + 1.2, R = P.R;
      const zig = []; const teeth = Math.max(6, Math.round((px1 - px0) / 2.2));
      for (let i = 0; i <= teeth; i++) zig.push([px1 - (px1 - px0) * i / teeth, ty1 - (i % 2 ? 0 : 1.1) + R.range(-0.15, 0.15)]);
      const shape = [[px0, ty0], [px1, ty0], ...zig];
      P.hatch([D.tf(shape, { x: 1.1, y: 1.3 })], { cut: [shape], angle: 45, pitch: 0.45, nib: 0.1, color: '#4d4448' });
      P.paper([shape]);
      P.colour([shape], o.ticketColor || '#fdfaf2', { pressure: 0.45, passes: 1 });
      P.colour([shape], '#efe3c8', { pressure: 0.4, passes: 1, cut: [D.rrect(px0 + 1.3, ty0 + 1.3, px1 - 1.3, ty1 - 2.2, 0.6)] });
      P.outline([shape], { nib: nib * 0.95 });
      P.ink([[px0 + 1.6, ty0 + 2.6], [px1 - 1.6, ty0 + 2.6]], { nib: 0.09, color: '#b5453a' });
      const pin = [(px0 + px1) / 2, ty0 + 0.4];
      P.hatch([D.ell(pin[0] + 0.9, pin[1] + 1.2, 1.7, 1.0)], { angle: 30, pitch: 0.4, nib: 0.09, color: '#4d4448' });
      P.paper([D.ell(pin[0], pin[1], 1.7, 1.7)]);
      P.colour([D.ell(pin[0], pin[1], 1.7, 1.7)], typeof o.pinColor === 'function' ? o.pinColor(n) : o.pinColor || '#cf4e43', { pressure: 0.9, passes: 2 });
      P.outline([D.ell(pin[0], pin[1], 1.7, 1.7)], { nib: 0.2 });
      P.paper([D.ell(pin[0] - 0.55, pin[1] - 0.6, 0.45, 0.32, -0.6)]);
      const lines = n.lines.map((q) => q.text);
      Lt.block(S, lines, (px0 + px1) / 2, cy + 0.6, { face, size: stateSize, color: P.INK, lineGap: 1.18 });
      if (o.numbers) Lt.write(S, o.numbers(n), px0 + 1.8, ty0 + 2.1, { face: 'serif-bold', size: 1.7, color: '#b5453a' });
      occupied.push({ x0: px0, x1: px1 + 1.1, y0: ty0 - 1.7, y1: ty1 + 1.3, what: 'state ' + lines.join(' ') });
      continue;
    }
    if (o.style === 'soft') {
      const px0 = m.X(n.cx - n.w / 2), rr = Math.min(3.4, (y1 - y0) * 0.34), shape = D.rrect(px0, y0, x1, y1, rr);
      P.hatch([D.tf(shape, { x: 1.3, y: 1.4 })], { cut: [shape], angle: 45, pitch: 0.48, nib: 0.11, color: P.INK });
      P.paper([shape]);
      const isBug = o.bugColor && (n.classes || []).includes('bugPath'), broke = (n.classes || []).includes('breaks');
      P.colour([shape], broke && o.breakFill ? o.breakFill : typeof o.tagColor === 'function' ? o.tagColor(n) : o.tagColor || '#f6e8c8', { pressure: 0.56, angle: 30, passes: 2 });
      if (isBug) P.outline([D.rrect(px0 - 1.1, y0 - 1.1, x1 + 1.1, y1 + 1.1, rr + 1.1)], { nib: nib * 1.5, color: o.bugColor });
      P.outline([shape], { nib: nib * 1.05 });
      const lines = n.lines.map((q) => q.text);
      Lt.block(S, lines, (px0 + x1) / 2, cy, { face, size: stateSize, color: P.INK, lineGap: 1.18 });
      occupied.push({ x0: px0, x1: x1 + 1.4, y0, y1: y1 + 1.4, what: 'state ' + lines.join(' ') });
      continue;
    }
    if (o.style === 'plate') {
      const px0 = m.X(n.cx - n.w / 2), shape = D.rrect(px0, y0, x1, y1, 1.6), inner = D.rrect(px0 + 1.2, y0 + 1.2, x1 - 1.2, y1 - 1.2, 1.0);
      P.paper([shape]);
      P.colour([shape], o.tagColor || '#d9b46a', { pressure: 0.72, angle: 20, passes: 2 });
      P.colour([shape], o.tagEdge || '#b48a45', { pressure: 0.55, angle: 20, passes: 1, cut: [D.rrect(px0 + 1.0, y0 + 1.0, x1 - 1.0, y1 - 1.0, 1.1)] });
      P.outline([shape], { nib: nib * 1.05 });
      P.outline([inner], { nib: nib * 0.5 });
      for (const [rx, ry] of [[px0 + 2.1, y0 + 2.1], [x1 - 2.1, y0 + 2.1], [px0 + 2.1, y1 - 2.1], [x1 - 2.1, y1 - 2.1]]) { P.dot(rx, ry, 0.62, '#5a4628'); }
      const lines = n.lines.map((q) => q.text);
      Lt.block(S, lines, (px0 + x1) / 2, cy, { face, size: stateSize, color: P.INK, lineGap: 1.18 });
      occupied.push({ x0: px0, x1, y0, y1, what: 'state ' + lines.join(' ') });
      continue;
    }
    const shape = tagShape(x0, y0, x1, y1, bevel), inner = tagShape(x0 + 1.1, y0 + 1.1, x1 - 1.1, y1 - 1.1, bevel - 0.6);
    P.paper([shape]);
    P.colour([shape], o.tagColor || '#ead8b0', { pressure: 0.62, angle: 28, passes: 2 });
    P.colour([shape], o.tagEdge || '#cdb183', { pressure: 0.55, angle: 28, passes: 1, cut: [tagShape(x0 + 0.9, y0 + 0.9, x1 - 0.9, y1 - 0.9, bevel - 0.4)] });
    P.outline([shape], { nib: nib * 1.05 });
    P.outline([inner], { nib: nib * 0.5 });
    const gx = x0 - bevel * 0.2, gr = Math.min(1.25, (y1 - y0) * 0.11);
    P.paper([D.ell(gx, cy, gr * 1.7, gr * 1.7)]);
    P.colour([D.ell(gx, cy, gr * 1.7, gr * 1.7)], '#b9a27a', { pressure: 0.7, passes: 1 });
    P.outline([D.ell(gx, cy, gr * 1.7, gr * 1.7)], { nib: nib * 0.6 });
    P.paper([D.ell(gx, cy, gr * 0.8, gr * 0.8)]);
    P.outline([D.ell(gx, cy, gr * 0.8, gr * 0.8)], { nib: nib * 0.5 });
    if (o.strings !== false) {
      const sx = gx - gr * 0.2, side = n.cy % 2 ? 1 : -1;
      P.curve([[sx, cy], [sx - 2.4, cy - side * 1.2], [sx - 4.4, cy + side * 0.6], [sx - 3.2, cy + side * 2.6], [sx - 1.4, cy + side * 1.4], [sx - 3.6, cy - side * 0.4], [sx - 6.4, cy + side * 1.8]], { nib: 0.16 });
    }
    const lines = n.lines.map((q) => q.text);
    Lt.block(S, lines, (x0 + x1) / 2 + 0.4, cy, { face, size: stateSize, color: P.INK, lineGap: 1.18 });
    occupied.push({ x0: x0 - bevel * 1.3 - 7, x1, y0, y1, what: 'state ' + lines.join(' ') });
  }

  for (const lb of L.labels) {
    const pl = labelPlace.get(lb.edge);
    if (pl) {
      const lh = labelSize * 1.22, top = pl.b.y0 + labelSize * 0.98;
      let open = false;
      lb.lines.forEach((q, i) => {
        const anchor = pl.side > 0 ? pl.b.x0 : pl.side < 0 ? pl.b.x1 : (pl.b.x0 + pl.b.x1) / 2, runs = [];
        let cur = '';
        for (const ch of q.text) { if (ch === '[') { if (cur) runs.push([cur, open]); cur = '['; open = true; continue; } cur += ch; if (ch === ']') { runs.push([cur, true]); cur = ''; open = false; } }
        if (cur) runs.push([cur, open]);
        const fo = { face: o.labelFace || 'serif-bold', size: labelSize, slant: o.slant ?? 0.2 }, widths = runs.map(([t]) => Lt.measure(t, fo.face, labelSize)), total = widths.reduce((a, b) => a + b, 0);
        let x = pl.side > 0 ? anchor : pl.side < 0 ? anchor - total : anchor - total / 2;
        runs.forEach(([t, cond], j) => { Lt.write(S, t, x, top + i * lh, { ...fo, align: 'left', color: cond && o.condColour ? (typeof o.condColour === 'function' ? o.condColour(lb.lines.map((qq) => qq.text).join(' ')) : o.condColour) : P.INK }); x += widths[j]; });
      });
      occupied.push({ ...pl.b, what: 'label ' + lb.lines.map((q) => q.text).join(' ') });
      continue;
    }
    lb.lines.forEach((q) => Lt.write(S, q.text, m.X(q.x), m.Y(q.y) + (labelSize - 14 * k) * 0.3, { face: o.labelFace || 'serif-bold', size: labelSize, color: P.INK, align: 'center', slant: o.slant ?? 0.2 }));
    occupied.push({ ...labelBoxes.get(lb.edge), what: 'label ' + lb.lines.map((q) => q.text).join(' ') });
  }

  for (const s of L.starts) {
    const [x, y] = m.P([s.cx, s.cy]), r = o.startR ?? 1.9;
    P.dot(x, y, r, o.startColor);
    P.outline([D.ell(x, y, r, r)], { nib: 0.25 });
    P.outline([D.ell(x, y, r + 1.1, r + 1.1)], { nib: 0.18 });
    occupied.push({ x0: x - r - 2, x1: x + r + 2, y0: y - r - 2, y1: y + r + 2, what: 'start' });
  }
  return { occupied, labelBoxes, labelPlace, L, stateSize, labelSize };
}

module.exports = { draw, tagShape, arrowHead };
