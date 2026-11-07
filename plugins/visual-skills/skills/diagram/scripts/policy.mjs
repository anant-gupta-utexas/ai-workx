import fs from 'node:fs';
import path from 'node:path';

// Only these two plain-text settings are interpreted; DESIGN.md remains prose.
export function readPolicy(input, design) {
  if (!design) {
    let dir = path.dirname(path.resolve(input));
    while (true) {
      const candidate = path.join(dir, 'DESIGN.md');
      if (fs.existsSync(candidate)) { design = candidate; break; }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  const policy = { defaultStyle: 'clean', artEnabled: true };
  if (!design) return policy;
  const seen = new Set();
  for (const line of fs.readFileSync(design, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:-\s+)?(Default diagram style|Hand-drawn support):\s*(.*?)\s*$/i);
    if (!match) continue;
    const key = match[1].toLowerCase(), value = match[2].toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate ${match[1]} in ${design}`);
    seen.add(key);
    if (key === 'default diagram style') {
      if (!['clean', 'hand-drawn'].includes(value)) throw new Error(`Invalid ${match[1]}: ${value}`);
      policy.defaultStyle = value;
    } else {
      if (!['enabled', 'disabled'].includes(value)) throw new Error(`Invalid ${match[1]}: ${value}`);
      policy.artEnabled = value === 'enabled';
    }
  }
  return policy;
}

export function selectStyle(explicit, policy) {
  const style = explicit ?? policy.defaultStyle;
  if (!['clean', 'hand-drawn'].includes(style)) throw new Error(`Invalid style: ${style}`);
  if (style === 'hand-drawn' && !policy.artEnabled)
    throw new Error('Hand-drawn support is disabled in DESIGN.md. Source preserved; choose clean or update that policy explicitly.');
  return style;
}
