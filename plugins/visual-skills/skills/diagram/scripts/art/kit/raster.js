'use strict';
// raster.js — sweeps a variable-width, variable-pressure stroke over the paper and deposits medium per pixel.
// A stroke first fills a scratch `cov` (max of what each swept segment would deposit, so one stroke never
// double-deposits on itself), then the medium's composite rule is applied once. Deposit depends on pressure
// against the paper tooth (dry media) or on flow (inks), never on a painted-on grain.

function compose(S, med, x0, y0, x1, y1) {
  const { W, cov, rgb, fill } = S;
  const mode = med.comp;
  for (let y = y0; y <= y1; y++) {
    let i = y * W + x0;
    for (let x = x0; x <= x1; x++, i++) {
      const c = cov[i]; if (c <= 0) continue; cov[i] = 0;
      const j = 3 * i;
      if (mode === 0) { // dry pigment: lerp toward pigment colour; heavy build-up cools and lightens (graphite sheen)
        const f = fill[i], al = c * med.opac;
        let cr = med.col[0], cg = med.col[1], cb = med.col[2];
        if (med.sheen) { const b = Math.min(1, f / 255) * med.sheen; cr += (med.sheenCol[0] - cr) * b; cg += (med.sheenCol[1] - cg) * b; cb += (med.sheenCol[2] - cb) * b; }
        rgb[j] += (cr - rgb[j]) * al; rgb[j + 1] += (cg - rgb[j + 1]) * al; rgb[j + 2] += (cb - rgb[j + 2]) * al;
        const nf = f + c * med.fillRate; fill[i] = nf > 255 ? 255 : nf;
      } else if (mode === 1) { // translucent ink: Beer-Lambert, layers deepen
        rgb[j] *= Math.exp(-med.k[0] * c); rgb[j + 1] *= Math.exp(-med.k[1] * c); rgb[j + 2] *= Math.exp(-med.k[2] * c);
      } else { // opaque (gel, pastel, crayon): lerp; also fills the tooth
        const f = fill[i], al = c * med.opac;
        rgb[j] += (med.col[0] - rgb[j]) * al; rgb[j + 1] += (med.col[1] - rgb[j + 1]) * al; rgb[j + 2] += (med.col[2] - rgb[j + 2]) * al;
        if (med.fillRate) { const nf = f + c * med.fillRate; fill[i] = nf > 255 ? 255 : nf; }
      }
    }
  }
}

// round-tip sweep along nodes P {n,x,y,r,p,s,flow} (px)
function sweep(S, P, med) {
  const { W, H, tooth, fill, cov } = S;
  const n = P.n, X = P.x, Y = P.y, RR = P.r, PP = P.p, SS = P.s, FL = P.flow, amount = med.amount, dry = med.dry, cap = med.fillCap ?? 0.84;
  let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
  const segs = n === 1 ? 1 : n - 1;
  for (let k = 0; k < segs; k++) {
    const k1 = n === 1 ? 0 : k + 1;
    const ax = X[k], ay = Y[k], bx = X[k1], by = Y[k1], ra = RR[k], rb = RR[k1];
    const rmax = Math.max(ra, rb) + 1.5;
    const xa = Math.max(0, Math.floor(Math.min(ax, bx) - rmax)), xb = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + rmax));
    const ya = Math.max(0, Math.floor(Math.min(ay, by) - rmax)), yb = Math.min(H - 1, Math.ceil(Math.max(ay, by) + rmax));
    if (xa > xb || ya > yb) continue;
    if (xa < bx0) bx0 = xa; if (xb > bx1) bx1 = xb; if (ya < by0) by0 = ya; if (yb > by1) by1 = yb;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, il2 = l2 > 0 ? 1 / l2 : 0, il = Math.sqrt(il2);
    const pa = PP[k], pb = PP[k1], sa = SS[k], sb = SS[k1], fa = FL[k], fb = FL[k1];
    for (let y = ya; y <= yb; y++) {
      const py = y + 0.5 - ay; let i = y * W + xa;
      for (let x = xa; x <= xb; x++, i++) {
        const px = x + 0.5 - ax;
        let t = (px * dx + py * dy) * il2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cx = px - t * dx, cy = py - t * dy;
        const d = Math.sqrt(cx * cx + cy * cy), r = ra + (rb - ra) * t;
        if (d > r + 1) continue;
        let h = tooth[i]; if (dry) { const f = fill[i] * 0.0033; h = h + (1 - h) * (f > cap ? cap : f); }
        const v = (dx * cy - dy * cx) * il >= 0 ? d / r : -d / r;
        const a = amount(pa + (pb - pa) * t, d, r, v, sa + (sb - sa) * t, h, fa + (fb - fa) * t, i);
        if (a > cov[i]) cov[i] = a;
      }
    }
  }
  if (bx1 >= 0) compose(S, med, bx0, by0, bx1, by1);
}

// chisel / broad nib stamped along nodes: nib is a rectangle halfW × halfH rotated by `ang` (fixed to the page)
function stamp(S, P, med, nib) {
  const { W, H, tooth, fill, cov } = S;
  const n = P.n, X = P.x, Y = P.y, PP = P.p, SS = P.s, FL = P.flow, amount = med.amount, dry = med.dry, cap = med.fillCap ?? 0.84;
  const hw = nib.hw, hh = nib.hh, rotK = nib.rot || 0, wick = nib.wick ?? 1.4;
  const ext = Math.hypot(hw, hh) + 1.5, exty = ext;
  let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
  for (let k = 0; k < n; k++) {
    const cx = X[k], cy = Y[k], p = PP[k], s = SS[k], fl = FL[k];
    const an = nib.ang + (n > 1 ? rotK * (k / (n - 1) - 0.5) : 0), ca = Math.cos(an), sa = Math.sin(an);
    const xa = Math.max(0, Math.floor(cx - ext)), xb = Math.min(W - 1, Math.ceil(cx + ext));
    const ya = Math.max(0, Math.floor(cy - exty)), yb = Math.min(H - 1, Math.ceil(cy + exty));
    if (xa > xb || ya > yb) continue;
    if (xa < bx0) bx0 = xa; if (xb > bx1) bx1 = xb; if (ya < by0) by0 = ya; if (yb > by1) by1 = yb;
    for (let y = ya; y <= yb; y++) {
      const py = y + 0.5 - cy; let i = y * W + xa;
      for (let x = xa; x <= xb; x++, i++) {
        const px = x + 0.5 - cx;
        const u = px * ca + py * sa, w = -px * sa + py * ca; // u across the nib width, w across its thickness
        const hj = (tooth[i] - 0.5) * wick, cu = hw + 0.5 - Math.abs(u) + hj, cw = hh + 0.5 - Math.abs(w) + hj * 0.5;
        if (cu <= 0 || cw <= 0) continue;
        const cover = (cu > 1 ? 1 : cu) * (cw > 1 ? 1 : cw);
        let h = tooth[i]; if (dry) { const f = fill[i] * 0.0033; h = h + (1 - h) * (f > cap ? cap : f); }
        const a = amount(p, Math.abs(u), hw, u / hw, s, h, fl, i, w / hh) * cover;
        if (a > cov[i]) cov[i] = a;
      }
    }
  }
  if (bx1 >= 0) compose(S, med, bx0, by0, bx1, by1);
}

module.exports = { sweep, stamp };
