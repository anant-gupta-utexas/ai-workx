#!/usr/bin/env python3
"""
PreToolUse Hook: Experiment Budget Guard

Blocks training commands that specify a time budget exceeding the configured
maximum. Prevents accidental long-running experiments.

Exit codes:
  0 - Allow (not a training command, or within budget)
  2 - Block (training command exceeds time budget)
"""

import json
import os
import re
import sys

MAX_STDIN = 1024 * 1024
DEFAULT_BUDGET = 300


def get_configured_budget():
    try:
        config_path = os.path.join(os.getcwd(), ".autoresearch", "config.yaml")
        with open(config_path, "r") as f:
            content = f.read()
        match = re.search(r"time_budget:\s*(\d+)", content)
        if match:
            return int(match.group(1))
    except (FileNotFoundError, IOError):
        pass
    return DEFAULT_BUDGET


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "experiment-budget-guard" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        command = inp.get("tool_input", {}).get("command", "")

        is_training = bool(
            re.search(r"\btrain\.py\b", command)
            or re.search(r"\buv\s+run\s+train\.py\b", command)
            or re.search(r"\bpython\s+.*train\.py\b", command)
        )

        if not is_training:
            sys.stdout.write(data)
            return

        timeout_match = re.search(r"--timeout\s+(\d+)", command)
        if timeout_match:
            requested_timeout = int(timeout_match.group(1))
            budget = get_configured_budget()
            max_allowed = budget * 2

            if requested_timeout > max_allowed:
                print(f"[Hook] BLOCKED: Training timeout {requested_timeout}s exceeds max allowed {max_allowed}s (budget: {budget}s).", file=sys.stderr)
                print("[Hook] Adjust .autoresearch/config.yaml time_budget if you need longer runs.", file=sys.stderr)
                sys.stdout.write(data)
                sys.exit(2)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] experiment-budget-guard error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
