'use strict';
const fs = require('fs');
const path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const FONTS = path.join(__dirname, '..', 'fonts');
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSans-Regular.ttf'), 'Kevin Sans');
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSans-Bold.ttf'), 'Kevin Sans Bold');
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSerif-Regular.ttf'), 'Kevin Serif');
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSerif-Bold.ttf'), 'Kevin Serif Bold');

let pele;
async function peleRender(source, o = {}) {
  pele ??= await import('pele');
  const g = createCanvas(8, 8).getContext('2d'), wide = o.wide || {};
  const measurer = {
    width(text, size, style) {
      g.font = `${size}px "${o.face || (o.bold || style & 1 ? 'Kevin Sans Bold' : 'Kevin Sans')}"`;
      return Math.max(g.measureText(text).width, wide[text] || 0);
    },
  };
  return pele.render(source, { measurer, fontFamily: 'Kevin Sans', fontSize: 16, padding: 12, responsive: false, limit: 1_000_000, outputLimit: 8_000_000, maxEdges: 10_000 });
}

const num = (s) => Number(s);
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`)); return m ? m[1] : undefined; };
const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

function pathPoints(d) {
  const out = [], tok = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi); let i = 0, cmd = '', x = 0, y = 0;
  const n = () => num(tok[i++]);
  while (i < tok.length) {
    if (/[A-Z]/i.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M' || cmd === 'L') { x = n(); y = n(); out.push([x, y]); }
    else if (cmd === 'H') { x = n(); out.push([x, y]); }
    else if (cmd === 'V') { y = n(); out.push([x, y]); }
    else if (cmd === 'C') {
      const x1 = n(), y1 = n(), x2 = n(), y2 = n(), x3 = n(), y3 = n(), x0 = x, y0 = y;
      for (let k = 1; k <= 16; k++) { const t = k / 16, u = 1 - t; out.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); }
      x = x3; y = y3;
    } else if (cmd === 'Z') { if (out.length) out.push(out[0].slice()); }
    else i++;
  }
  return out;
}
function textLines(t) {
  const spans = [...t.matchAll(/<tspan([^>]*)>([^<]*)<\/tspan>/g)];
  if (spans.length) return spans.map((m) => ({ text: unescape(m[2]), x: num(attr(m[1], 'x')), y: num(attr(m[1], 'y')) }));
  const m = t.match(/<text([^>]*)>([^<]*)<\/text>/);
  return m ? [{ text: unescape(m[2]), x: num(attr(m[1], 'x') ?? 0), y: num(attr(m[1], 'y') ?? 0) }] : [];
}

function readState(svg) {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/), L = { width: num(vb[1]), height: num(vb[2]), clusters: [], dividers: [], edges: [], labels: [], nodes: [], starts: [] };
  const title = svg.match(/<text class="pele-title"[^>]*>([\s\S]*?)<\/text>/);
  if (title) L.title = textLines(title[0]);
  const off = svg.match(/<g transform="translate\(([\d.]+),([\d.]+)\)">/), ox = off ? num(off[1]) : 0, oy = off ? num(off[2]) : 0;
  const P = (p) => [p[0] + ox, p[1] + oy];
  for (const m of svg.matchAll(/<g class="pele-cluster[^"]*" data-id="([^"]+)">([\s\S]*?)<\/g>/g)) {
    const rect = m[2].match(/<rect[^>]*>/)[0], head = m[2].match(/<path d="M[\d.]+,([\d.]+)H/), label = textLines(m[2].match(/<text[\s\S]*?<\/text>/)[0]);
    L.clusters.push({ id: m[1], x: num(attr(rect, 'x')) + ox, y: num(attr(rect, 'y')) + oy, w: num(attr(rect, 'width')), h: num(attr(rect, 'height')), rx: num(attr(rect, 'rx') || 0), headY: head ? num(head[1]) + oy : undefined, label: label.map((l) => ({ ...l, x: l.x + ox, y: l.y + oy })) });
  }
  for (const m of svg.matchAll(/<path class="pele-divider" d="([^"]+)"/g)) L.dividers.push(pathPoints(m[1]).map(P));
  for (const m of svg.matchAll(/<g class="pele-edge [^"]*" data-id="([^"]+)">([\s\S]*?)<\/g>/g)) {
    const paths = [...m[2].matchAll(/<path( class="pele-marker")? d="([^"]+)"/g)];
    const line = paths.find((p) => !p[1]), marker = paths.find((p) => p[1]);
    L.edges.push({ id: m[1], pts: pathPoints(line[2]).map(P), marker: marker ? pathPoints(marker[2]).map(P) : undefined });
  }
  for (const m of svg.matchAll(/<g class="pele-edge-label" data-id="([^"]+)">([\s\S]*?)<\/g>/g)) {
    const rect = m[2].match(/<rect[^>]*>/)[0];
    L.labels.push({ edge: m[1], x: num(attr(rect, 'x')) + ox, y: num(attr(rect, 'y')) + oy, w: num(attr(rect, 'width')), h: num(attr(rect, 'height')), lines: textLines(m[2].match(/<text[\s\S]*?<\/text>/)[0]).map((l) => ({ ...l, x: l.x + ox, y: l.y + oy })) });
  }
  for (const m of svg.matchAll(/<g class="pele-node pele-state((?: [^"]*)?)" data-id="([^"]+)" transform="translate\(([-\d.]+),([-\d.]+)\)">([\s\S]*?)<\/g>/g)) {
    const rect = m[5].match(/<rect[^>]*>/)[0], cx = num(m[3]) + ox, cy = num(m[4]) + oy;
    L.nodes.push({ id: m[2], classes: m[1].trim().split(/\s+/).filter(Boolean), cx, cy, w: num(attr(rect, 'width')), h: num(attr(rect, 'height')), rx: num(attr(rect, 'rx') || 0), lines: textLines(m[5].match(/<text[\s\S]*?<\/text>/)[0]).map((l) => ({ ...l, x: l.x + cx, y: l.y + cy })) });
  }
  for (const m of svg.matchAll(/<g class="pele-node pele-state-start" data-id="([^"]+)" transform="translate\(([-\d.]+),([-\d.]+)\)">\s*<circle r="([\d.]+)"/g))
    L.starts.push({ id: m[1], cx: num(m[2]) + ox, cy: num(m[3]) + oy, r: num(m[4]) });
  return L;
}

async function layOut(mmd, o = {}) {
  const r = await peleRender(fs.readFileSync(mmd, 'utf8'), o);
  if (o.svgOut) fs.writeFileSync(o.svgOut, r.svg);
  return { ...readState(r.svg), svg: r.svg };
}

function mapper(box, to) {
  const k = Math.min(to.w / box.w, to.h / box.h), ox = to.x + (to.w - box.w * k) / 2, oy = to.y + (to.h - box.h * k) / 2;
  return { k, P: (p) => [ox + (p[0] - box.x) * k, oy + (p[1] - box.y) * k], X: (x) => ox + (x - box.x) * k, Y: (y) => oy + (y - box.y) * k };
}

function contentBox(L) {
  const xs = L.nodes.flatMap((n) => [n.cx - n.w / 2, n.cx + n.w / 2]).concat(L.labels.flatMap((l) => [l.x, l.x + l.w]), L.starts.flatMap((s) => [s.cx - s.r, s.cx + s.r]));
  const ys = L.nodes.flatMap((n) => [n.cy - n.h / 2, n.cy + n.h / 2]).concat(L.labels.flatMap((l) => [l.y, l.y + l.h]), L.starts.flatMap((s) => [s.cy - s.r, s.cy + s.r]));
  for (const e of L.edges) for (const p of e.pts) { xs.push(p[0]); ys.push(p[1]); }
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function saveShapes(file, L, m) {
  const r = (v) => Math.round(v * 100) / 100, pt = (p) => m.P(p).map(r), k = m.k;
  const box = (x, y, w, h, rx) => [m.X(x), m.Y(y), w * k, h * k, (rx || 0) * k].map(r);
  fs.writeFileSync(file, JSON.stringify({
    boxes: L.clusters.map((c) => box(c.x, c.y, c.w, c.h, c.rx)).concat(L.nodes.map((n) => box(n.cx - n.w / 2, n.cy - n.h / 2, n.w, n.h, n.rx))),
    lines: L.clusters.filter((c) => c.headY !== undefined).map((c) => [[c.x, c.headY], [c.x + c.w, c.headY]]).concat(L.dividers, L.edges.map((e) => e.pts)).map((q) => q.map(pt)),
    heads: L.edges.filter((e) => e.marker).map((e) => e.marker.map(pt)),
    dots: L.starts.map((s) => [...pt([s.cx, s.cy]), r(s.r * k)]),
  }));
}

module.exports = { layOut, readState, pathPoints, mapper, contentBox, saveShapes };
