#!/usr/bin/env node
/**
 * PreToolUse Hook: Block --no-verify
 *
 * Prevents `git commit --no-verify` which bypasses pre-commit hooks.
 *
 * Exit codes:
 *   0 - Allow (not a --no-verify commit)
 *   2 - Block (--no-verify detected)
 */

const MAX_STDIN = 1024 * 1024;

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('block-no-verify')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    if (command.includes('git commit') && command.includes('--no-verify')) {
      console.error('[Hook] BLOCKED: git commit --no-verify is not allowed.');
      console.error('[Hook] Pre-commit hooks exist to protect code quality. Remove --no-verify and fix any issues.');
      process.stdout.write(data);
      process.exit(2);
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] block-no-verify error: ${err.message}`);
    process.stdout.write(data);
  }
});
