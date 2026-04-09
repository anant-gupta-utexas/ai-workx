#!/usr/bin/env node
/**
 * PreToolUse Hook: Experiment Budget Guard
 *
 * Blocks training commands that specify a time budget exceeding the configured
 * maximum. Prevents accidental long-running experiments.
 *
 * Exit codes:
 *   0 - Allow (not a training command, or within budget)
 *   2 - Block (training command exceeds time budget)
 */

const fs = require('fs');
const path = require('path');
const MAX_STDIN = 1024 * 1024;
const DEFAULT_BUDGET = 300;

function getConfiguredBudget() {
  try {
    const configPath = path.join(process.cwd(), '.autoresearch', 'config.yaml');
    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/time_budget:\s*(\d+)/);
    if (match) return parseInt(match[1], 10);
  } catch {}
  return DEFAULT_BUDGET;
}

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('experiment-budget-guard')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    const isTraining = /\btrain\.py\b/.test(command) ||
                       /\buv\s+run\s+train\.py\b/.test(command) ||
                       /\bpython\s+.*train\.py\b/.test(command);

    if (!isTraining) {
      process.stdout.write(data);
      return;
    }

    const timeoutMatch = command.match(/--timeout\s+(\d+)/);
    if (timeoutMatch) {
      const requestedTimeout = parseInt(timeoutMatch[1], 10);
      const budget = getConfiguredBudget();
      const maxAllowed = budget * 2;

      if (requestedTimeout > maxAllowed) {
        console.error(`[Hook] BLOCKED: Training timeout ${requestedTimeout}s exceeds max allowed ${maxAllowed}s (budget: ${budget}s).`);
        console.error(`[Hook] Adjust .autoresearch/config.yaml time_budget if you need longer runs.`);
        process.stdout.write(data);
        process.exit(2);
      }
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] experiment-budget-guard error: ${err.message}`);
    process.stdout.write(data);
  }
});
