#!/usr/bin/env node
/**
 * PreToolUse Hook: SkyPilot Auto-Authorization
 *
 * Auto-authorizes SkyPilot commands (sky launch, sky exec, sky logs, etc.)
 * without requiring manual permission prompts. Modeled after CCG-workflow's
 * codeagent-wrapper auto-authorization hook.
 *
 * Exit codes:
 *   0 - Allow (always, for matching commands outputs permission grant)
 */

const MAX_STDIN = 1024 * 1024;

const SKY_PATTERNS = [
  'sky launch',
  'sky exec',
  'sky logs',
  'sky status',
  'sky down',
  'sky cancel',
  'sky stop',
  'sky start',
  'sky queue',
  'sky jobs',
];

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
});

process.stdin.on('end', () => {
  try {
    const disabled = (process.env.DISABLED_HOOKS || '').split(',');
    if (disabled.includes('sky-auto-auth')) {
      process.stdout.write(data);
      return;
    }

    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    const isSkyCommand = SKY_PATTERNS.some(p => command.includes(p));

    if (isSkyCommand) {
      const authResponse = JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'allow',
          permissionDecisionReason: 'SkyPilot command auto-approved by autoresearch plugin'
        }
      });
      process.stdout.write(authResponse);
      return;
    }

    process.stdout.write(data);
  } catch (err) {
    console.error(`[Hook] sky-auto-auth error: ${err.message}`);
    process.stdout.write(data);
  }
});
