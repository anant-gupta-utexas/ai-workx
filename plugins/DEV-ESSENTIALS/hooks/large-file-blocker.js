#!/usr/bin/env node
/**
 * PreToolUse Hook: Large File Blocker
 *
 * Blocks creation of files exceeding 800 lines.
 * Suggests splitting into smaller, focused modules.
 *
 * Exit codes:
 *   0 - File is within limits
 *   2 - File exceeds 800 lines (blocked)
 */

const MAX_STDIN = 1024 * 1024;
const MAX_LINES = 800;

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('large-file-blocker')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const content = input.tool_input?.content || '';
    const filePath = input.tool_input?.file_path || '';

    if (/\.(lock|svg|json|csv|sql)$/i.test(filePath)) {
      process.stdout.write(data);
      return;
    }

    const lineCount = content.split('\n').length;

    if (lineCount > MAX_LINES) {
      console.error(`[Hook] BLOCKED: File exceeds ${MAX_LINES} lines (${lineCount} lines): ${filePath}`);
      console.error('[Hook] Split into smaller, focused modules for better maintainability.');
      process.stdout.write(data);
      process.exit(2);
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] large-file-blocker error: ${err.message}`);
    process.stdout.write(data);
  }
});
