#!/usr/bin/env node
/**
 * PreToolUse Hook: Commit Quality Check
 *
 * Validates commit quality before git commit:
 * - Conventional commit message format
 * - console.log / debugger detection in staged files
 * - TODO/FIXME without issue references
 *
 * Exit codes:
 *   0 - Warnings only (allow commit)
 *   2 - Critical issues (block commit)
 */

const { spawnSync } = require('child_process');
const MAX_STDIN = 1024 * 1024;

const CHECKABLE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs'];

function getStagedFiles() {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return [];
  return result.stdout.trim().split('\n').filter(f => f.length > 0);
}

function getStagedFileContent(filePath) {
  const result = spawnSync('git', ['show', `:${filePath}`], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return result.status === 0 ? result.stdout : null;
}

function shouldCheck(filePath) {
  return CHECKABLE_EXTENSIONS.some(ext => filePath.endsWith(ext));
}

function validateCommitMessage(command) {
  const messageMatch = command.match(/(?:-m|--message)[=\s]+["']?([^"']+)["']?/);
  if (!messageMatch) return [];

  const message = messageMatch[1];
  const issues = [];
  const conventionalFormat = /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?:\s*.+/;

  if (!conventionalFormat.test(message)) {
    issues.push({
      severity: 'warning',
      message: 'Commit message does not follow conventional format: <type>(<scope>): <description>',
    });
  }

  if (message.length > 72) {
    issues.push({
      severity: 'warning',
      message: `Subject line too long (${message.length} chars, max 72)`,
    });
  }

  return issues;
}

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('commit-quality')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    if (!command.includes('git commit') || command.includes('--amend')) {
      process.stdout.write(data);
      return;
    }

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      process.stdout.write(data);
      return;
    }

    let errorCount = 0;
    let warningCount = 0;

    const filesToCheck = stagedFiles.filter(shouldCheck);
    for (const file of filesToCheck) {
      const content = getStagedFileContent(file);
      if (!content) continue;

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        if (/\bdebugger\b/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('#')) {
          console.error(`[Hook] ERROR ${file}:${lineNum} - debugger statement found`);
          errorCount++;
        }

        if (line.includes('console.log') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          console.error(`[Hook] WARNING ${file}:${lineNum} - console.log found`);
          warningCount++;
        }

        const todoMatch = line.match(/\/\/\s*(TODO|FIXME):?\s*(.+)/);
        if (todoMatch && !todoMatch[2].match(/#\d+|issue/i)) {
          console.error(`[Hook] INFO ${file}:${lineNum} - ${todoMatch[1]} without issue reference`);
        }
      }
    }

    const messageIssues = validateCommitMessage(command);
    for (const issue of messageIssues) {
      console.error(`[Hook] WARNING: ${issue.message}`);
      warningCount++;
    }

    if (errorCount > 0 || warningCount > 0) {
      console.error(`\n[Hook] Summary: ${errorCount} error(s), ${warningCount} warning(s)`);
    }

    if (errorCount > 0) {
      console.error('[Hook] BLOCKED: Fix errors before committing.');
      process.stdout.write(data);
      process.exit(2);
    }

    if (warningCount > 0) {
      console.error('[Hook] Warnings found but commit is allowed.');
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] commit-quality error: ${err.message}`);
    process.stdout.write(data);
  }
});
