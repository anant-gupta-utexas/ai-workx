#!/usr/bin/env python3
"""
PreToolUse Hook: Pre-commit Security Scan

Scans staged files for hardcoded secrets before git commit.
Detects: API keys, tokens, passwords, AWS keys.

Exit codes:
  0 - No secrets found
  2 - Secrets detected, block commit
"""

import json
import os
import re
import subprocess
import sys

MAX_STDIN = 1024 * 1024

SECRET_PATTERNS = [
    (re.compile(r"sk-[a-zA-Z0-9]{20,}"), "OpenAI API key"),
    (re.compile(r"ghp_[a-zA-Z0-9]{36}"), "GitHub PAT"),
    (re.compile(r"AKIA[A-Z0-9]{16}"), "AWS Access Key"),
    (re.compile(r"api[_\-]?key\s*[=:]\s*['\"][^'\"]{8,}['\"]", re.IGNORECASE), "API key assignment"),
    (re.compile(r"password\s*[=:]\s*['\"][^'\"]+['\"]", re.IGNORECASE), "Hardcoded password"),
    (re.compile(r"secret\s*[=:]\s*['\"][^'\"]{8,}['\"]", re.IGNORECASE), "Hardcoded secret"),
]

SKIP_EXTENSIONS = re.compile(r"\.(md|txt|json|yaml|yml|lock|svg|png|jpg|gif)$", re.IGNORECASE)


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


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "pre-commit-security" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        command = inp.get("tool_input", {}).get("command", "")

        if "git commit" not in command:
            sys.stdout.write(data)
            return

        staged_files = get_staged_files()
        if not staged_files:
            sys.stdout.write(data)
            return

        secrets_found = 0

        for file in staged_files:
            if SKIP_EXTENSIONS.search(file):
                continue

            content = get_staged_file_content(file)
            if not content:
                continue

            for i, line in enumerate(content.split("\n"), 1):
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("#"):
                    continue

                for pattern, name in SECRET_PATTERNS:
                    if pattern.search(line):
                        print(f"[Hook] SECRET FOUND in {file}:{i} - {name}", file=sys.stderr)
                        secrets_found += 1

        if secrets_found > 0:
            print(f"\n[Hook] BLOCKED: {secrets_found} potential secret(s) detected in staged files.", file=sys.stderr)
            print("[Hook] Remove secrets and use environment variables instead.", file=sys.stderr)
            sys.stdout.write(data)
            sys.exit(2)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] pre-commit-security error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
