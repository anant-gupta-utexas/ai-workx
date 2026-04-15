#!/usr/bin/env python3
"""
PreToolUse Hook: Large File Blocker

Blocks creation of files exceeding 800 lines.
Suggests splitting into smaller, focused modules.

Exit codes:
  0 - File is within limits
  2 - File exceeds 800 lines (blocked)
"""

import json
import os
import re
import sys

MAX_STDIN = 1024 * 1024
MAX_LINES = 800

SKIP_EXTENSIONS = re.compile(r"\.(lock|svg|json|csv|sql)$", re.IGNORECASE)


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "large-file-blocker" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        content = inp.get("tool_input", {}).get("content", "")
        file_path = inp.get("tool_input", {}).get("file_path", "")

        if SKIP_EXTENSIONS.search(file_path):
            sys.stdout.write(data)
            return

        line_count = len(content.split("\n"))

        if line_count > MAX_LINES:
            print(f"[Hook] BLOCKED: File exceeds {MAX_LINES} lines ({line_count} lines): {file_path}", file=sys.stderr)
            print("[Hook] Split into smaller, focused modules for better maintainability.", file=sys.stderr)
            sys.stdout.write(data)
            sys.exit(2)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] large-file-blocker error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
