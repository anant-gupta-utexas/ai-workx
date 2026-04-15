#!/usr/bin/env python3
"""
PreToolUse Hook: Commit Quality Check

Validates commit quality before git commit:
- Conventional commit message format
- console.log / debugger detection in staged files
- TODO/FIXME without issue references

Exit codes:
  0 - Warnings only (allow commit)
  2 - Critical issues (block commit)
"""

import json
import os
import re
import subprocess
import sys

MAX_STDIN = 1024 * 1024

CHECKABLE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs"]

CONVENTIONAL_FORMAT = re.compile(
    r"^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?:\s*.+"
)
MESSAGE_RE = re.compile(r"""(?:-m|--message)[=\s]+["']?([^"']+)["']?""")
TODO_RE = re.compile(r"//\s*(TODO|FIXME):?\s*(.+)")


def get_staged_files():
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return []
    return [f for f in result.stdout.strip().split("\n") if f]


def get_staged_file_content(file_path):
    result = subprocess.run(
        ["git", "show", f":{file_path}"],
        capture_output=True, text=True,
    )
    return result.stdout if result.returncode == 0 else None


def should_check(file_path):
    return any(file_path.endswith(ext) for ext in CHECKABLE_EXTENSIONS)


def validate_commit_message(command):
    match = MESSAGE_RE.search(command)
    if not match:
        return []

    message = match.group(1)
    issues = []

    if not CONVENTIONAL_FORMAT.match(message):
        issues.append("Commit message does not follow conventional format: <type>(<scope>): <description>")

    if len(message) > 72:
        issues.append(f"Subject line too long ({len(message)} chars, max 72)")

    return issues


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "commit-quality" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        command = inp.get("tool_input", {}).get("command", "")

        if "git commit" not in command or "--amend" in command:
            sys.stdout.write(data)
            return

        staged_files = get_staged_files()
        if not staged_files:
            sys.stdout.write(data)
            return

        error_count = 0
        warning_count = 0

        for file in filter(should_check, staged_files):
            content = get_staged_file_content(file)
            if not content:
                continue

            for i, line in enumerate(content.split("\n"), 1):
                stripped = line.strip()

                if re.search(r"\bdebugger\b", line) and not stripped.startswith("//") and not stripped.startswith("#"):
                    print(f"[Hook] ERROR {file}:{i} - debugger statement found", file=sys.stderr)
                    error_count += 1

                if "console.log" in line and not stripped.startswith("//") and not stripped.startswith("*"):
                    print(f"[Hook] WARNING {file}:{i} - console.log found", file=sys.stderr)
                    warning_count += 1

                todo_match = TODO_RE.search(line)
                if todo_match and not re.search(r"#\d+|issue", todo_match.group(2), re.IGNORECASE):
                    print(f"[Hook] INFO {file}:{i} - {todo_match.group(1)} without issue reference", file=sys.stderr)

        for issue in validate_commit_message(command):
            print(f"[Hook] WARNING: {issue}", file=sys.stderr)
            warning_count += 1

        if error_count > 0 or warning_count > 0:
            print(f"\n[Hook] Summary: {error_count} error(s), {warning_count} warning(s)", file=sys.stderr)

        if error_count > 0:
            print("[Hook] BLOCKED: Fix errors before committing.", file=sys.stderr)
            sys.stdout.write(data)
            sys.exit(2)

        if warning_count > 0:
            print("[Hook] Warnings found but commit is allowed.", file=sys.stderr)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] commit-quality error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
