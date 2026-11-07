import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { scripts } from './helpers.mjs';

test('real plugin renders with only pele installed and no optional backend or host lookups', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-skills-clean-'));
  t.after(() => {
    if (process.env.VISUAL_SKILLS_KEEP_TEST_OUTPUT === '1') console.log(`Isolation artifacts: ${temp}`);
    else fs.rmSync(temp, { recursive: true, force: true });
  });
  const plugin = path.resolve(scripts, '../../..');
  const staged = path.join(temp, 'visual-skills');
  fs.cpSync(plugin, staged, { recursive: true, verbatimSymlinks: true, filter: file =>
    !['node_modules', 'art'].includes(path.basename(file)) });
  assert.equal(fs.realpathSync(path.join(staged, '.claude-plugin/plugin.json')),
    fs.realpathSync(path.join(staged, 'plugin.json')));
  const core = path.join(staged, 'skills/diagram/scripts');
  assert(!fs.existsSync(path.join(core, 'art')));
  assert(!fs.existsSync(path.join(core, 'fonts')));
  assert(!fs.existsSync(path.join(staged, 'skills/visual-brief')));
  const bin = path.join(temp, 'bin');
  fs.mkdirSync(bin);
  fs.symlinkSync(process.execPath, path.join(bin, process.platform === 'win32' ? 'node.exe' : 'node'));
  // Explicit allowlist excludes NODE_PATH, NODE_OPTIONS, PYTHONPATH, runtime module roots, etc.
  const env = { PATH: bin, HOME: temp, SystemRoot: process.env.SystemRoot,
    npm_config_cache: process.env.npm_config_cache ?? path.join(os.tmpdir(), 'visual-skills-npm-cache') };
  const npm = process.env.npm_execpath;
  assert(npm, 'Run this release gate through npm test so npm_execpath identifies npm-cli.js');
  const install = spawnSync(process.execPath, [npm, 'ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: core, env, encoding: 'utf8', timeout: 120_000 });
  assert.equal(install.status, 0, install.stderr + install.stdout);
  const lock = JSON.parse(fs.readFileSync(path.join(core, 'package-lock.json')));
  assert.deepEqual(Object.keys(lock.packages).filter(Boolean), ['node_modules/pele']);
  const probe = `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import { createRequire } from 'node:module';
    import { spawnSync } from 'node:child_process';
    import { renderClean } from './render.mjs';
    const require = createRequire(import.meta.url);
    for (const module of ['@napi-rs/canvas', 'sharp'])
      assert.throws(() => require.resolve(module), { code: 'MODULE_NOT_FOUND' });
    for (const command of ['python', 'python3', 'uv', 'colloquium', 'gs', 'chromium'])
      assert.equal(spawnSync(command, ['--version']).error?.code, 'ENOENT');
    const fixtures = JSON.parse(fs.readFileSync('test/fixtures/expectations.json'));
    fs.mkdirSync('output');
    for (const [name, expected] of Object.entries(fixtures)) {
      const file = 'test/fixtures/' + name + '.mmd';
      const source = fs.readFileSync(file, 'utf8');
      const svg = renderClean(source);
      assert(!svg.includes('var('));
      for (const label of expected.labels) assert(svg.includes(label), name + ': ' + label);
      for (const marker of expected.markers ?? []) assert(svg.includes(marker), name + ': ' + marker);
      assert.equal(renderClean(source), svg);
      fs.writeFileSync('output/' + name + '.svg', svg);
      const cli = spawnSync(process.execPath, ['render.mjs', '--mmd', file, '--out', 'output/cli-' + name + '.svg'], { env: process.env, encoding: 'utf8' });
      assert.equal(cli.status, 0, cli.stderr);
      assert.equal(fs.readFileSync('output/cli-' + name + '.svg', 'utf8'), svg);
      assert.equal(fs.readFileSync(file, 'utf8'), source);
    }
    const missing = spawnSync(process.execPath, ['render.mjs', '--mmd', 'test/fixtures/order.mmd', '--out', 'output/art.png', '--style', 'hand-drawn'], { encoding: 'utf8' });
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /npm ci/);
    assert(!fs.existsSync('output/art.png'));
    console.log('Six fixtures + fresh default CLI processes passed; canvas, sharp, art, fonts, Python, uv and Colloquium absent.');
  `;
  fs.writeFileSync(path.join(core, 'isolation-probe.mjs'), probe);
  const result = spawnSync(process.execPath, ['isolation-probe.mjs'],
    { cwd: core, env, encoding: 'utf8', timeout: 30_000 });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  console.log(result.stdout.trim());
});
