#!/usr/bin/env node
/**
 * PostToolUse Hook: Test File Reminder
 *
 * When a new source file is created, checks if a corresponding
 * test file exists and reminds to write tests.
 *
 * Non-blocking (exit code 0).
 */

const fs = require('fs');
const path = require('path');
const MAX_STDIN = 1024 * 1024;

const SOURCE_PATTERNS = [
  { ext: /\.(ts|js)$/, testSuffix: ['.test.$1', '.spec.$1'] },
  { ext: /\.py$/, testSuffix: ['test_', '_test.py'] },
  { ext: /\.go$/, testSuffix: ['_test.go'] },
];

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('test-file-reminder')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    if (/\.(test|spec|_test)\./i.test(filePath) || /test_/i.test(path.basename(filePath))) {
      process.stdout.write(data);
      return;
    }

    if (!/\/(src|internal|lib|app|pkg|cmd)\//i.test(filePath) && !/^(src|internal|lib|app|pkg|cmd)\//i.test(filePath)) {
      process.stdout.write(data);
      return;
    }

    let isSource = false;
    let testPaths = [];

    for (const { ext, testSuffix } of SOURCE_PATTERNS) {
      if (ext.test(filePath)) {
        isSource = true;
        const dir = path.dirname(filePath);
        const base = path.basename(filePath);

        for (const suffix of testSuffix) {
          if (suffix.startsWith('test_')) {
            testPaths.push(path.join(dir, `test_${base}`));
          } else if (suffix.includes('$1')) {
            const replaced = base.replace(ext, suffix.replace('$1', base.match(ext)[0].substring(1)));
            testPaths.push(path.join(dir, replaced));
          } else {
            testPaths.push(path.join(dir, base.replace(ext, suffix)));
          }
        }
        break;
      }
    }

    if (!isSource) {
      process.stdout.write(data);
      return;
    }

    const hasTest = testPaths.some(tp => {
      try { return fs.existsSync(tp); } catch { return false; }
    });

    if (!hasTest) {
      console.error(`[Hook] REMINDER: No test file found for ${filePath}`);
      console.error(`[Hook] Expected test at: ${testPaths[0]}`);
      console.error('[Hook] Consider writing tests first (TDD: RED -> GREEN -> REFACTOR).');
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] test-file-reminder error: ${err.message}`);
    process.stdout.write(data);
  }
});
