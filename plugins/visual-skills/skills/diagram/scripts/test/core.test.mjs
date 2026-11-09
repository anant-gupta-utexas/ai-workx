import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { renderClean } from '../render.mjs';
import { portableSvg } from '../theme.mjs';
import { readPolicy, selectStyle } from '../policy.mjs';
import { spawnSync } from 'node:child_process';
import { cli, fixtureDir, scripts } from './helpers.mjs';

test('standalone plugin registration, host manifest and skill inventory agree', () => {
  const plugin = path.resolve(scripts, '../../..');
  const manifest = JSON.parse(fs.readFileSync(path.join(plugin, 'plugin.json')));
  assert.equal(fs.realpathSync(path.join(plugin, '.claude-plugin/plugin.json')),
    fs.realpathSync(path.join(plugin, 'plugin.json')));
  assert(!manifest.dependencies?.length);
  const marketplace = JSON.parse(fs.readFileSync(path.resolve(plugin, '../../.claude-plugin/marketplace.json')));
  const entries = marketplace.plugins.filter(entry => entry.name === manifest.name);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].version, manifest.version);
  assert.equal(entries[0].description, manifest.description);
  assert.deepEqual(fs.readdirSync(path.join(plugin, 'skills')).sort(), ['diagram', 'visual-brief']);
});

test('portable SVG resolves nested fallbacks without rewriting labels and rejects bad variables', () => {
  assert.equal(portableSvg('<svg style="--a:var(--b, red)"><path fill="var(--a)"/></svg>'),
    '<svg style="--a: red"><path fill=" red"/></svg>');
  assert.match(portableSvg('<text font-family="var(--pele-font)"/>'), /Arial/);
  assert.throws(() => portableSvg('<path fill="var(--unknown)"/>'), /Unresolved/);
  assert.throws(() => portableSvg('<path fill="var(--missing"/>'), /Unclosed/);
  assert.throws(() => portableSvg('<svg style="--a:var(--b);--b:var(--a)"/>'), /cycle/);
  assert.match(renderClean('stateDiagram-v2\nstate "var(--label)" as A\nA --> B'), />var\(--label\)</);
});

test('six supported fixtures retain labels, topology markers, sources and repeat bytes', () => {
  const fixtures = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'expectations.json')));
  for (const [name, expected] of Object.entries(fixtures)) {
    const file = path.join(fixtureDir, name + '.mmd');
    const source = fs.readFileSync(file, 'utf8');
    const svg = renderClean(source);
    assert.match(svg, /^<svg/);
    assert(!svg.includes('var('));
    for (const label of expected.labels) assert(svg.includes(label), `${name}: ${label}`);
    for (const marker of expected.markers ?? []) assert(svg.includes(marker), `${name}: ${marker}`);
    if (expected.nodes) assert.equal((svg.match(/class="pele-node pele-state"/g) ?? []).length, expected.nodes);
    if (expected.edges) assert.equal((svg.match(/class="pele-edge /g) ?? []).length, expected.edges);
    assert.equal(renderClean(source), svg);
    assert.equal(fs.readFileSync(file, 'utf8'), source);
  }
  assert.throws(() => renderClean('not a diagram'), /./);
});

test('project policy selects clean by default and disables explicit art', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-policy-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'nested/chart.mmd');
  fs.mkdirSync(path.dirname(input));
  assert.deepEqual(readPolicy(input), { defaultStyle: 'clean', artEnabled: true });
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), 'Default diagram style: hand-drawn\nHand-drawn support: enabled\n');
  const policy = readPolicy(input);
  assert.equal(selectStyle(undefined, policy), 'hand-drawn');
  assert.equal(selectStyle('clean', policy), 'clean');
  fs.writeFileSync(path.join(dir, 'nested/DESIGN.md'), 'Default diagram style: clean\nHand-drawn support: disabled\n');
  assert.equal(selectStyle(undefined, readPolicy(input)), 'clean');
  assert.throws(() => selectStyle('hand-drawn', readPolicy(input)), /disabled/);
  assert.throws(() => readPolicy(input, path.join(dir, 'absent.md')), /ENOENT/);
  fs.writeFileSync(path.join(dir, 'nested/DESIGN.md'), 'Hand-drawn support: sometimes');
  assert.throws(() => readPolicy(input), /Invalid/);
  fs.writeFileSync(path.join(dir, 'nested/DESIGN.md'), 'Default diagram style: clean\nDefault diagram style: hand-drawn');
  assert.throws(() => readPolicy(input), /Duplicate/);
  assert.throws(() => selectStyle('watercolour', policy), /Invalid/);
});

test('CLI writes SVG/source, validates options and protects input aliases', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-cli-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'chart.mmd');
  const source = fs.readFileSync(path.join(fixtureDir, 'terminal.mmd'), 'utf8');
  fs.writeFileSync(input, source);
  const out = path.join(dir, 'nested/chart.svg');
  let result = cli(['--mmd', input, '--out', out]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).renderer, 'pele');
  assert.equal(fs.readFileSync(out, 'utf8'), renderClean(source));
  const commandAlias = path.join(dir, 'render.mjs');
  fs.symlinkSync(path.join(scripts, 'render.mjs'), commandAlias);
  const viaAlias = spawnSync(process.execPath, [commandAlias, '--mmd', input, '--out', out], { encoding: 'utf8' });
  assert.equal(viaAlias.status, 0, viaAlias.stderr);
  assert.match(viaAlias.stdout, /"renderer":"pele"/);
  const copy = path.join(dir, 'copy.mmd');
  assert.equal(cli(['--mmd', input, '--out', copy, '--source-only']).status, 0);
  assert.equal(fs.readFileSync(copy, 'utf8'), source);
  for (const args of [[], ['--wat'], ['--mmd', input, '--out', input],
    ['--mmd', input, '--out', out, '--style', 'wrong'],
    ['--mmd', input, '--out', path.join(dir, 'wrong.png')],
    ['--mmd', input, '--out', out, '--fast'],
    ['--mmd', input, '--out', copy, '--source-only', '--style', 'hand-drawn']]) {
    assert.notEqual(cli(args).status, 0, JSON.stringify(args));
  }
  assert.equal(cli(['--help']).status, 0);
  const alias = path.join(dir, 'alias.svg');
  fs.symlinkSync(input, alias);
  result = cli(['--mmd', input, '--out', alias]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /source/);
  fs.unlinkSync(alias);
  fs.linkSync(input, alias);
  assert.notEqual(cli(['--mmd', input, '--out', alias]).status, 0);
  assert.equal(fs.readFileSync(input, 'utf8'), source);
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), 'Hand-drawn support: disabled');
  result = cli(['--mmd', input, '--out', path.join(dir, 'art.png'), '--style', 'hand-drawn']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /disabled/);
  assert(!fs.existsSync(path.join(dir, 'art.png')));
});
