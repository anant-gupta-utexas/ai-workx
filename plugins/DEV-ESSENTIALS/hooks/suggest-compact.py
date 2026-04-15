#!/usr/bin/env python3
"""
PreToolUse Hook: Suggest Compact

Counts tool invocations and suggests /compact every ~50 calls
to manage context window size.

Non-blocking (exit code 0).
"""

import json
import os
import sys
import tempfile

MAX_STDIN = 1024 * 1024
COMPACT_INTERVAL = 50
STATE_FILE = os.path.join(tempfile.gettempdir(), ".claude-hook-tool-count")


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "suggest-compact" in disabled:
            sys.stdout.write(data)
            return

        count = 0
        try:
            with open(STATE_FILE, "r") as f:
                count = int(f.read().strip())
        except (FileNotFoundError, ValueError):
            pass

        count += 1

        with open(STATE_FILE, "w") as f:
            f.write(str(count))

        if count > 0 and count % COMPACT_INTERVAL == 0:
            print(f"[Hook] You've made ~{count} tool calls this session. Consider running /compact to manage context window size.", file=sys.stderr)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] suggest-compact error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
