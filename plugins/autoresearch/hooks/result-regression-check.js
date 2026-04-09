#!/usr/bin/env node
/**
 * PostToolUse Hook: Result Regression Check
 *
 * After editing train.py (or similar training scripts), reminds the agent
 * to run an experiment before committing the change.
 *
 * Non-blocking (exit code 0).
 */

const fs = require('fs');
const path = require('path');
const MAX_STDIN = 1024 * 1024;

const TRAINING_FILES = ['train.py', 'training.py', 'train_model.py'];

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('result-regression-check')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';
    const basename = path.basename(filePath);

    const isTrainingFile = TRAINING_FILES.some(f => basename === f) ||
                           /train.*\.py$/.test(basename);

    if (!isTrainingFile) {
      process.stdout.write(data);
      return;
    }

    const logPath = path.join(process.cwd(), '.autoresearch', 'experiments', 'experiment-log.jsonl');
    let lastRunTime = 0;
    try {
      const stat = fs.statSync(logPath);
      lastRunTime = stat.mtimeMs;
    } catch {}

    const fileModTime = Date.now();
    const timeSinceLastRun = fileModTime - lastRunTime;
    const fiveMinutes = 5 * 60 * 1000;

    if (timeSinceLastRun > fiveMinutes || lastRunTime === 0) {
      console.error(`[Hook] REMINDER: You edited ${basename}. Run an experiment before committing.`);
      console.error(`[Hook] Use: /experiment run — or: uv run train.py`);
      if (lastRunTime === 0) {
        console.error('[Hook] No experiment log found. Run /experiment baseline to establish a baseline first.');
      }
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] result-regression-check error: ${err.message}`);
    process.stdout.write(data);
  }
});
