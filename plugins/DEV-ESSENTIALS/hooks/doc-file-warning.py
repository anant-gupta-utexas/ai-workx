#!/usr/bin/env python3
"""
PreToolUse Hook: Doc File Warning

Warns about creating non-standard .md/.txt files outside of
recognized locations (docs/, skills/, resources/).

Non-blocking (exit code 0).
"""

import json
import os
import re
import sys

MAX_STDIN = 1024 * 1024

ALLOWED_NAMES = {
    "README", "CLAUDE", "CONTRIBUTING", "CHANGELOG", "LICENSE",
    "SKILL", "AGENTS", "INTERNALS", "REFERENCE", "TROUBLESHOOTING",
    "ADVANCED",
}

ALLOWED_DIRS = ["docs", "skills", "resources", "dev", "commands", "agents", ".cursor"]


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "doc-file-warning" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        file_path = inp.get("tool_input", {}).get("file_path", "")

        if not re.search(r"\.(md|txt)$", file_path, re.IGNORECASE):
            sys.stdout.write(data)
            return

        base_name = os.path.splitext(os.path.basename(file_path))[0].upper()
        if base_name in ALLOWED_NAMES:
            sys.stdout.write(data)
            return

        normalized = file_path.replace("\\", "/")
        if any(f"/{d}/" in normalized or normalized.startswith(f"{d}/") for d in ALLOWED_DIRS):
            sys.stdout.write(data)
            return

        print(f"[Hook] WARNING: Creating non-standard doc file: {file_path}", file=sys.stderr)
        print("[Hook] Consider placing documentation in docs/, skills/resources/, or using a standard name (README, CONTRIBUTING, etc.).", file=sys.stderr)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] doc-file-warning error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
