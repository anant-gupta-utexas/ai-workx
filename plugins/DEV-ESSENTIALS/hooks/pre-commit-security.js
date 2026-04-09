#!/usr/bin/env node
/**
 * PreToolUse Hook: Pre-commit Security Scan
 *
 * Scans staged files for hardcoded secrets before git commit.
 * Detects: API keys, tokens, passwords, AWS keys.
 *
 * Exit codes:
 *   0 - No secrets found
 *   2 - Secrets detected, block commit
 */

const { spawnSync } = require('child_process');
const MAX_STDIN = 1024 * 1024;

const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI API key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub PAT' },
  { pattern: /AKIA[A-Z0-9]{16}/, name: 'AWS Access Key' },
  { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]{8,}['"]/i, name: 'API key assignment' },
  { pattern: /password\s*[=:]\s*['"][^'"]+['"]/i, name: 'Hardcoded password' },
  { pattern: /secret\s*[=:]\s*['"][^'"]{8,}['"]/i, name: 'Hardcoded secret' },
];

function getStagedFileContent(filePath) {
  const result = spawnSync('git', ['show', `:${filePath}`], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return result.status === 0 ? result.stdout : null;
}

function getStagedFiles() {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return [];
  return result.stdout.trim().split('\n').filter(f => f.length > 0);
}

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('pre-commit-security')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    if (!command.includes('git commit')) {
      process.stdout.write(data);
      return;
    }

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      process.stdout.write(data);
      return;
    }

    let secretsFound = 0;

    for (const file of stagedFiles) {
      if (/\.(md|txt|json|yaml|yml|lock|svg|png|jpg|gif)$/i.test(file)) continue;

      const content = getStagedFileContent(file);
      if (!content) continue;

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('//') || line.trim().startsWith('#')) continue;

        for (const { pattern, name } of SECRET_PATTERNS) {
          if (pattern.test(line)) {
            console.error(`[Hook] SECRET FOUND in ${file}:${i + 1} - ${name}`);
            secretsFound++;
          }
        }
      }
    }

    if (secretsFound > 0) {
      console.error(`\n[Hook] BLOCKED: ${secretsFound} potential secret(s) detected in staged files.`);
      console.error('[Hook] Remove secrets and use environment variables instead.');
      process.stdout.write(data);
      process.exit(2);
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] pre-commit-security error: ${err.message}`);
    process.stdout.write(data);
  }
});
