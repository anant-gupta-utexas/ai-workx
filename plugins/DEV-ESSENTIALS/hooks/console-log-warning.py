#!/usr/bin/env python3
"""
PostToolUse Hook: Console Log Warning

Warns about debug statements (console.log, print(), fmt.Println())
in edited files after an Edit operation.

Non-blocking (exit code 0).
"""

import json
import os
import re
import sys

MAX_STDIN = 1024 * 1024

DEBUG_PATTERNS = [
    (re.compile(r"console\.log\("), "JavaScript/TypeScript"),
    (re.compile(r"console\.debug\("), "JavaScript/TypeScript"),
    (re.compile(r"\bprint\s*\("), "Python"),
    (re.compile(r"fmt\.Print(?:ln|f)?\("), "Go"),
    (re.compile(r"System\.out\.print"), "Java"),
]


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "console-log-warning" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        new_string = inp.get("tool_input", {}).get("new_string", "")
        file_path = inp.get("tool_input", {}).get("file_path", "")

        if not new_string or re.search(r"\.(test|spec|_test)\.", file_path, re.IGNORECASE):
            sys.stdout.write(data)
            return

        found = set()
        for pattern, lang in DEBUG_PATTERNS:
            if pattern.search(new_string):
                found.add(lang)

        if found:
            langs = ", ".join(sorted(found))
            print(f"[Hook] WARNING: Debug statement detected in {file_path} ({langs})", file=sys.stderr)
            print("[Hook] Remember to remove debug statements before committing.", file=sys.stderr)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] console-log-warning error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
