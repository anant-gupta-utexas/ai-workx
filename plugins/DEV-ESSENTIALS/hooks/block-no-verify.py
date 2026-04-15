#!/usr/bin/env python3
"""
PreToolUse Hook: Block --no-verify

Prevents `git commit --no-verify` which bypasses pre-commit hooks.

Exit codes:
  0 - Allow (not a --no-verify commit)
  2 - Block (--no-verify detected)
"""

import json
import os
import sys

MAX_STDIN = 1024 * 1024

def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "block-no-verify" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        command = inp.get("tool_input", {}).get("command", "")

        if "git commit" in command and "--no-verify" in command:
            print("[Hook] BLOCKED: git commit --no-verify is not allowed.", file=sys.stderr)
            print("[Hook] Pre-commit hooks exist to protect code quality. Remove --no-verify and fix any issues.", file=sys.stderr)
            sys.stdout.write(data)
            sys.exit(2)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] block-no-verify error: {err}", file=sys.stderr)
        sys.stdout.write(data)

if __name__ == "__main__":
    main()
