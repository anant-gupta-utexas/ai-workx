import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const scripts = fileURLToPath(new URL('../', import.meta.url));
export const fixtureDir = path.join(scripts, 'test/fixtures');
export function cli(args, options = {}) {
  return spawnSync(process.execPath, [path.join(scripts, 'render.mjs'), ...args], {
    encoding: 'utf8', ...options,
  });
}
