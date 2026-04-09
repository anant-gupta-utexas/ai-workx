#!/usr/bin/env node
/**
 * PostToolUse Hook: Console Log Warning
 *
 * Warns about debug statements (console.log, print(), fmt.Println())
 * in edited files after an Edit operation.
 *
 * Non-blocking (exit code 0).
 */

const MAX_STDIN = 1024 * 1024;

const DEBUG_PATTERNS = [
  { pattern: /console\.log\(/, lang: 'JavaScript/TypeScript' },
  { pattern: /console\.debug\(/, lang: 'JavaScript/TypeScript' },
  { pattern: /\bprint\s*\(/, lang: 'Python' },
  { pattern: /fmt\.Print(ln|f)?\(/, lang: 'Go' },
  { pattern: /System\.out\.print/, lang: 'Java' },
];

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('console-log-warning')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const newString = input.tool_input?.new_string || '';
    const filePath = input.tool_input?.file_path || '';

    if (!newString || /\.(test|spec|_test)\./i.test(filePath)) {
      process.stdout.write(data);
      return;
    }

    const found = [];
    for (const { pattern, lang } of DEBUG_PATTERNS) {
      if (pattern.test(newString)) {
        found.push(lang);
      }
    }

    if (found.length > 0) {
      const langs = [...new Set(found)].join(', ');
      console.error(`[Hook] WARNING: Debug statement detected in ${filePath} (${langs})`);
      console.error('[Hook] Remember to remove debug statements before committing.');
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] console-log-warning error: ${err.message}`);
    process.stdout.write(data);
  }
});
