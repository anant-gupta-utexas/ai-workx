'use strict';
const path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { hexToRgb } = require('../kit/util');

const FONTS = path.join(__dirname, '..', 'fonts');
const FACES = { serif: 'Kevin Serif', 'serif-bold': 'Kevin Serif Bold', sans: 'Kevin Sans', 'sans-bold': 'Kevin Sans Bold' };
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSerif-Regular.ttf'), FACES.serif);
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSerif-Bold.ttf'), FACES['serif-bold']);
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSans-Regular.ttf'), FACES.sans);
GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSans-Bold.ttf'), FACES['sans-bold']);

const probe = createCanvas(8, 8).getContext('2d');
const fontOf = (face, px) => `${px}px "${FACES[face] || face}"`;
function measure(text, face, size, spacing = 0) {
  probe.font = fontOf(face, 100);
  return (probe.measureText(text).width / 100) * size + spacing * size * Math.max(0, [...text].length - 1);
}

function write(S, text, x, y, o = {}) {
  const { ppm, W, H, tooth, rgb, fill } = S;
  const face = o.face || 'sans', size = o.size || 4, px = size * ppm, sp = (o.spacing || 0) * px;
  const col = hexToRgb(o.color || '#2b2420'), opac = o.opacity ?? 0.97, reach = o.reach ?? 0.9, soft = 0.32;
  probe.font = fontOf(face, px);
  const chars = [...text], widths = chars.map((c) => probe.measureText(c).width);
  const w = sp ? widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1) : probe.measureText(text).width;
  const pad = Math.ceil(px * 0.5), cw = Math.ceil(w + 2 * pad), ch = Math.ceil(px * 1.6 + 2 * pad);
  const slant = o.slant || 0;
  const c = createCanvas(cw + Math.ceil(px * Math.abs(slant)), ch), g = c.getContext('2d');
  if (slant) g.setTransform(1, 0, -slant, 1, px * slant * 1.05, 0);
  g.font = fontOf(face, px); g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
  const base = pad + px * 1.05;
  if (sp) { let cx = pad; chars.forEach((ch1, i) => { g.fillText(ch1, cx, base); cx += widths[i] + sp; }); }
  else g.fillText(text, pad, base);
  const a = g.getImageData(0, 0, c.width, ch).data, cwide = c.width;
  const x0 = Math.round(x * ppm - (o.align === 'center' ? w / 2 : o.align === 'right' ? w : 0) - pad - px * slant * 0.62), y0 = Math.round(y * ppm - base);
  const R = S.R, ph = R() * 6.28, amp = o.wobble ?? 0.06;
  for (let yy = 0; yy < ch; yy++) {
    const Y = y0 + yy; if (Y < 0 || Y >= H) continue;
    for (let xx = 0; xx < cwide; xx++) {
      const al = a[4 * (yy * cwide + xx) + 3]; if (!al) continue;
      const X = x0 + xx; if (X < 0 || X >= W) continue;
      const i = Y * W + X, h = tooth[i];
      let k = (h - (1 - reach)) / soft + 0.5; k = k < 0 ? 0 : k > 1 ? 1 : k;
      const p = 1 - amp + amp * Math.sin(ph + xx / px * 2.1);
      const d = (al / 255) * (0.55 + 0.45 * k) * opac * p, j = 3 * i;
      rgb[j] += (col[0] - rgb[j]) * d; rgb[j + 1] += (col[1] - rgb[j + 1]) * d; rgb[j + 2] += (col[2] - rgb[j + 2]) * d;
      const nf = fill[i] + d * 60; fill[i] = nf > 255 ? 255 : nf;
    }
  }
  return { x0: x0 / ppm + pad / ppm, y0: (y0 + base - px) / ppm, w: w / ppm, h: px / ppm };
}

function block(S, lines, cx, cy, o = {}) {
  const size = o.size || 4, lh = size * (o.lineGap || 1.3), n = lines.length;
  const top = cy - ((n - 1) * lh) / 2 + size * 0.36;
  return lines.map((t, i) => write(S, t, cx, top + i * lh, { align: 'center', ...o }));
}

module.exports = { write, block, measure, FACES };
