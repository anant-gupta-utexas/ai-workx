#!/usr/bin/env node
/**
 * PreToolUse Hook: Suggest Compact
 *
 * Counts tool invocations and suggests /compact every ~50 calls
 * to manage context window size.
 *
 * Non-blocking (exit code 0).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const MAX_STDIN = 1024 * 1024;

const COMPACT_INTERVAL = 50;
const STATE_FILE = path.join(os.tmpdir(), '.claude-hook-tool-count');

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('suggest-compact')) {
      process.stdout.write(data);
      return;
    }

    let count = 0;
    try {
      count = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10) || 0;
    } catch {
      // File doesn't exist yet
    }

    count++;
    fs.writeFileSync(STATE_FILE, String(count), 'utf8');

    if (count > 0 && count % COMPACT_INTERVAL === 0) {
      console.error(`[Hook] You've made ~${count} tool calls this session. Consider running /compact to manage context window size.`);
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] suggest-compact error: ${err.message}`);
    process.stdout.write(data);
  }
});
