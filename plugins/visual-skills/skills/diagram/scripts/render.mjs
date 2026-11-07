import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';
import { render } from 'pele';
import { portableSvg } from './theme.mjs';
import { readPolicy, selectStyle } from './policy.mjs';
import { protectSource, sha256, writeOutput } from './io.mjs';

export function renderClean(source) {
  return portableSvg(render(source, { responsive: false, limit: 1e6, outputLimit: 8e6,
    maxEdges: 1e4, fontFamily: 'Arial' }).svg);
}

export function main(args = process.argv.slice(2)) {
  const { values: options } = parseArgs({ args, options: {
    mmd: { type: 'string' }, out: { type: 'string' }, style: { type: 'string' },
    design: { type: 'string' }, 'source-only': { type: 'boolean' },
    fast: { type: 'boolean' }, title: { type: 'string' }, seed: { type: 'string' },
    help: { type: 'boolean' },
  } });
  const usage = 'node render.mjs --mmd chart.mmd --out chart.svg [--style clean|hand-drawn] [--design DESIGN.md]\n' +
    'Source only: --source-only --out copy.mmd\nOptional art: --style hand-drawn --out chart.png [--fast] [--title text] [--seed text]';
  if (options.help) { console.log(usage); return; }
  if (!options.mmd || !options.out) throw new Error(usage);
  protectSource(options.mmd, [options.out]);
  const source = fs.readFileSync(options.mmd);
  if (options['source-only']) {
    if (options.style || options.fast || options.title !== undefined || options.seed !== undefined)
      throw new Error('--source-only cannot be combined with rendering options.');
    if (path.extname(options.out).toLowerCase() !== '.mmd') throw new Error('Source output must use .mmd');
    writeOutput(options.out, source);
    console.log(JSON.stringify({ renderer: 'source', out: path.resolve(options.out), sourceSha256: sha256(source) }));
    return;
  }
  const style = selectStyle(options.style, readPolicy(options.mmd, options.design));
  if (style === 'hand-drawn') {
    // No art module, font or dependency is read or imported on the clean path.
    const backend = fileURLToPath(new URL('./art/plate.mjs', import.meta.url));
    if (!fs.existsSync(backend))
      throw new Error('Optional art backend is absent. Source preserved. Restore art/ and run npm ci --prefix art to enable it.');
    const forwarded = ['--mmd', path.resolve(options.mmd), '--out', path.resolve(options.out)];
    for (const name of ['design', 'title', 'seed'])
      if (options[name] !== undefined) forwarded.push('--' + name, options[name]);
    if (options.fast) forwarded.push('--fast');
    const result = spawnSync(process.execPath, [backend, ...forwarded], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr.trim() || 'Optional art renderer failed. Source preserved.');
    process.stdout.write(result.stdout);
    return;
  }
  if (options.fast || options.title !== undefined || options.seed !== undefined)
    throw new Error('--fast, --title and --seed apply only to hand-drawn rendering.');
  if (path.extname(options.out).toLowerCase() !== '.svg') throw new Error('Clean output must use .svg');
  const svg = renderClean(source.toString('utf8'));
  writeOutput(options.out, svg);
  console.log(JSON.stringify({ renderer: 'pele', version: '1.9.0', style: 'clean', font: 'Arial',
    node: process.version, out: path.resolve(options.out), sourceSha256: sha256(source), outputSha256: sha256(svg) }));
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
