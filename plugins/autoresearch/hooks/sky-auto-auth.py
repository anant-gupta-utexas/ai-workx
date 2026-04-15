#!/usr/bin/env python3
"""
PreToolUse Hook: SkyPilot Auto-Authorization

Auto-authorizes SkyPilot commands (sky launch, sky exec, sky logs, etc.)
without requiring manual permission prompts.

Exit codes:
  0 - Allow (always, for matching commands outputs permission grant)
"""

import json
import os
import sys

MAX_STDIN = 1024 * 1024

SKY_PATTERNS = [
    "sky launch",
    "sky exec",
    "sky logs",
    "sky status",
    "sky down",
    "sky cancel",
    "sky stop",
    "sky start",
    "sky queue",
    "sky jobs",
]


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "sky-auto-auth" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        command = inp.get("tool_input", {}).get("command", "")

        is_sky_command = any(p in command for p in SKY_PATTERNS)

        if is_sky_command:
            auth_response = json.dumps({
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                    "permissionDecisionReason": "SkyPilot command auto-approved by autoresearch plugin",
                }
            })
            sys.stdout.write(auth_response)
            return

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] sky-auto-auth error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
