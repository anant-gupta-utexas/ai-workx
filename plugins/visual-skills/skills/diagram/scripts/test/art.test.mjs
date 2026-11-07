import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cli, scripts, fixtureDir } from './helpers.mjs';
import { prepareLayout } from '../art/layout.mjs';

test('art layout preserves existing YAML and direction without rewriting the source', () => {
  const source = '---\ntitle: "Existing title"\nconfig:\n  state:\n    rankSpacing: 48\n    nodeSpacing: 72\n---\nstateDiagram-v2\n  direction LR\nA --> B\n';
  assert.equal(prepareLayout(source).layout, source);
  assert.match(prepareLayout('---\ntitle: preserved\n---\nstateDiagram-v2\nA --> B').layout,
    /^---\ntitle: preserved\n---\nstateDiagram-v2\n  direction TB/);
});

test('installed art is opt-in, repeatable, preserves graph and source, and obeys policy', t => {
  const requireArt = createRequire(path.join(scripts, 'art/package.json'));
  assert(requireArt.resolve('@napi-rs/canvas'), 'Install optional art before running test:art');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-art-'));
  t.after(() => {
    if (process.env.VISUAL_SKILLS_KEEP_TEST_OUTPUT === '1') console.log(`Art artifacts: ${dir}`);
    else fs.rmSync(dir, { recursive: true, force: true });
  });
  for (const [name, nodes, edges] of [['order', 7, 8], ['delivery', 4, 5]]) {
    const input = path.join(dir, name + '.mmd');
    // Deliberately remove frontmatter config and direction: the user provides bare source.
    const source = fs.readFileSync(path.join(fixtureDir, name + '.mmd'), 'utf8')
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^\s*direction\s+\w+\s*$/m, '');
    fs.writeFileSync(input, source);
    const clean = cli(['--mmd', input, '--out', path.join(dir, name + '.svg')]);
    assert.equal(clean.status, 0, clean.stderr);
    assert.equal(JSON.parse(clean.stdout).style, 'clean');
    assert(!fs.existsSync(path.join(dir, name + '-layout.mmd')));
    const png = path.join(dir, name + '.png');
    const args = ['--mmd', input, '--out', png, '--style', 'hand-drawn', '--fast'];
    const result = cli(args);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.nodes, nodes);
    assert.equal(report.edges, edges);
    assert.equal(report.starts, 1);
    assert.equal(report.style, 'hand-drawn');
    const bytes = fs.readFileSync(png);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), 1080);
    assert(fs.existsSync(png.replace('.png', '-layout.svg')));
    assert(fs.existsSync(png.replace('.png', '-shapes.json')));
    const layout = fs.readFileSync(png.replace('.png', '-layout.mmd'), 'utf8');
    assert.match(layout, /rankSpacing: 26/);
    assert.match(layout, /nodeSpacing: 60/);
    assert.match(layout, /direction TB/);
    const again = cli(args);
    assert.equal(again.status, 0, again.stderr);
    assert.deepEqual(fs.readFileSync(png), bytes);
    assert.equal(fs.readFileSync(input, 'utf8'), source);
  }
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), 'Default diagram style: hand-drawn\nHand-drawn support: disabled\n');
  const input = path.join(dir, 'order.mmd');
  const out = path.join(dir, 'blocked.png');
  let result = cli(['--mmd', input, '--out', out, '--style', 'hand-drawn']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /disabled/);
  // Direct optional entrypoint must respect the same disable policy.
  result = spawnSync(process.execPath, [path.join(scripts, 'art/plate.mjs'), '--mmd', input, '--out', out], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /disabled/);
  assert(!fs.existsSync(out));
  result = cli(['--mmd', input, '--out', path.join(dir, 'allowed.svg'), '--style', 'clean']);
  assert.equal(result.status, 0, result.stderr);
});

test('missing art dependencies leave source intact and clean rendering available', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-no-art-deps-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const staged = path.join(dir, 'scripts');
  fs.cpSync(scripts, staged, { recursive: true,
    filter: file => path.basename(file) !== 'node_modules' });
  fs.cpSync(path.join(scripts, 'node_modules'), path.join(staged, 'node_modules'), { recursive: true });
  const input = path.join(dir, 'chart.mmd'), out = path.join(dir, 'chart.png');
  const source = fs.readFileSync(path.join(fixtureDir, 'delivery.mmd'), 'utf8');
  fs.writeFileSync(input, source);
  const run = args => spawnSync(process.execPath, [path.join(staged, 'render.mjs'), ...args], { encoding: 'utf8' });
  const art = run(['--mmd', input, '--out', out, '--style', 'hand-drawn']);
  assert.equal(art.status, 1);
  assert.match(art.stderr, /npm ci --prefix art/);
  assert(!fs.existsSync(out));
  assert.equal(fs.readFileSync(input, 'utf8'), source);
  const clean = run(['--mmd', input, '--out', path.join(dir, 'clean.svg')]);
  assert.equal(clean.status, 0, clean.stderr);
});

test('art rejects unsupported semantics without producing output or changing source', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-art-errors-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const cases = [
    ['terminal', fs.readFileSync(path.join(fixtureDir, 'terminal.mmd'), 'utf8'), /final/],
    ['sequence', fs.readFileSync(path.join(fixtureDir, 'sequence.mmd'), 'utf8'), /stateDiagram-v2/],
    ['marked', 'stateDiagram-v2\nA --> B\nclass B breaks', /verification/],
    ['markedInline', 'stateDiagram-v2\nA --> B:::mayBreak', /verification/],
    ['composite', 'stateDiagram-v2\nstate "Working" as W {\nA --> B\n}', /[Cc]omposite/],
    ['day', fs.readFileSync(path.join(fixtureDir, 'day.mmd'), 'utf8'), /[Cc]omposite/],
    ['parallel', 'stateDiagram-v2\nA --> B\n--\nC --> D', /parallel/],
    ['note', 'stateDiagram-v2\nA --> B\nnote right of A: ignored', /Unsupported/],
    ['choice', 'stateDiagram-v2\nstate C <<choice>>\nA --> C', /Unsupported/],
  ];
  for (const [name, source, error] of cases) {
    const input = path.join(dir, name + '.mmd'), out = path.join(dir, name + '.png');
    fs.writeFileSync(input, source);
    const result = cli(['--mmd', input, '--out', out, '--style', 'hand-drawn', '--fast']);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, error);
    assert(!fs.existsSync(out));
    assert(!fs.existsSync(out.replace('.png', '-layout.mmd')));
    assert.equal(fs.readFileSync(input, 'utf8'), source);
  }
});
