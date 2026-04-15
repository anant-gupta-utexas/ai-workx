#!/usr/bin/env python3
"""
PostToolUse Hook: Result Regression Check

After editing train.py (or similar training scripts), reminds the agent
to run an experiment before committing the change.

Non-blocking (exit code 0).
"""

import json
import os
import re
import sys
import time

MAX_STDIN = 1024 * 1024

TRAINING_FILES = ["train.py", "training.py", "train_model.py"]


def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "result-regression-check" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        file_path = inp.get("tool_input", {}).get("file_path", "")
        basename = os.path.basename(file_path)

        is_training_file = (
            basename in TRAINING_FILES
            or bool(re.search(r"train.*\.py$", basename))
        )

        if not is_training_file:
            sys.stdout.write(data)
            return

        log_path = os.path.join(os.getcwd(), ".autoresearch", "experiments", "experiment-log.jsonl")
        last_run_time = 0
        try:
            last_run_time = os.stat(log_path).st_mtime * 1000
        except (FileNotFoundError, OSError):
            pass

        file_mod_time = time.time() * 1000
        time_since_last_run = file_mod_time - last_run_time
        five_minutes = 5 * 60 * 1000

        if time_since_last_run > five_minutes or last_run_time == 0:
            print(f"[Hook] REMINDER: You edited {basename}. Run an experiment before committing.", file=sys.stderr)
            print("[Hook] Use: /experiment run — or: uv run train.py", file=sys.stderr)
            if last_run_time == 0:
                print("[Hook] No experiment log found. Run /experiment baseline to establish a baseline first.", file=sys.stderr)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] result-regression-check error: {err}", file=sys.stderr)
        sys.stdout.write(data)


if __name__ == "__main__":
    main()
