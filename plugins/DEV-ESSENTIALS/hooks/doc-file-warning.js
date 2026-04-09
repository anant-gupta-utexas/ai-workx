#!/usr/bin/env node
/**
 * PreToolUse Hook: Doc File Warning
 *
 * Warns about creating non-standard .md/.txt files outside of
 * recognized locations (docs/, skills/, resources/).
 *
 * Non-blocking (exit code 0).
 */

const path = require('path');
const MAX_STDIN = 1024 * 1024;

const ALLOWED_NAMES = [
  'README', 'CLAUDE', 'CONTRIBUTING', 'CHANGELOG', 'LICENSE',
  'SKILL', 'AGENTS', 'INTERNALS', 'REFERENCE', 'TROUBLESHOOTING',
  'ADVANCED',
];

const ALLOWED_DIRS = ['docs', 'skills', 'resources', 'dev', 'commands', 'agents', '.cursor'];

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('doc-file-warning')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    if (!/\.(md|txt)$/i.test(filePath)) {
      process.stdout.write(data);
      return;
    }

    const baseName = path.basename(filePath, path.extname(filePath)).toUpperCase();
    if (ALLOWED_NAMES.includes(baseName)) {
      process.stdout.write(data);
      return;
    }

    const normalizedPath = filePath.replace(/\\/g, '/');
    const inAllowedDir = ALLOWED_DIRS.some(dir => normalizedPath.includes(`/${dir}/`) || normalizedPath.startsWith(`${dir}/`));
    if (inAllowedDir) {
      process.stdout.write(data);
      return;
    }

    console.error(`[Hook] WARNING: Creating non-standard doc file: ${filePath}`);
    console.error('[Hook] Consider placing documentation in docs/, skills/resources/, or using a standard name (README, CONTRIBUTING, etc.).');

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] doc-file-warning error: ${err.message}`);
    process.stdout.write(data);
  }
});
