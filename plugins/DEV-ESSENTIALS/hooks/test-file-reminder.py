#!/usr/bin/env python3
"""
PostToolUse Hook: Test File Reminder

When a new source file is created, checks if a corresponding
test file exists and reminds to write tests.

Non-blocking (exit code 0).
"""

import json
import os
import re
import sys

MAX_STDIN = 1024 * 1024

SOURCE_PATTERNS = [
    (re.compile(r"\.(ts|js)$"), lambda base, ext: [
        re.sub(r"\.(ts|js)$", lambda m: f".test.{m.group(1)}", base),
        re.sub(r"\.(ts|js)$", lambda m: f".spec.{m.group(1)}", base),
    ]),
    (re.compile(r"\.py$"), lambda base, ext: [
        f"test_{base}",
        re.sub(r"\.py$", "_test.py", base),
    ]),
    (re.compile(r"\.go$"), lambda base, ext: [
        re.sub(r"\.go$", "_test.go", base),
    ]),
]

SOURCE_DIRS = re.compile(r"(?:^|/)(src|internal|lib|app|pkg|cmd)/", re.IGNORECASE)


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "test-file-reminder" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        file_path = inp.get("tool_input", {}).get("file_path", "")
        basename = os.path.basename(file_path)

        if re.search(r"\.(test|spec|_test)\.", file_path, re.IGNORECASE) or re.search(r"^test_", basename, re.IGNORECASE):
            sys.stdout.write(data)
            return

        if not SOURCE_DIRS.search(file_path):
            sys.stdout.write(data)
            return

        test_paths = []
        is_source = False
        dir_name = os.path.dirname(file_path)

        for ext_re, make_test_names in SOURCE_PATTERNS:
            if ext_re.search(file_path):
                is_source = True
                for test_name in make_test_names(basename, ext_re):
                    test_paths.append(os.path.join(dir_name, test_name))
                break

        if not is_source:
            sys.stdout.write(data)
            return

        has_test = any(os.path.exists(tp) for tp in test_paths)

        if not has_test:
            print(f"[Hook] REMINDER: No test file found for {file_path}", file=sys.stderr)
            print(f"[Hook] Expected test at: {test_paths[0]}", file=sys.stderr)
            print("[Hook] Consider writing tests first (TDD: RED -> GREEN -> REFACTOR).", file=sys.stderr)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] test-file-reminder error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
