#!/usr/bin/env bash
#
# Experiment Wrapper
#
# Standardized experiment execution with time budget enforcement,
# metric parsing, and structured result logging.
#
# Usage: ./hooks/experiment-wrapper.sh [training-script] [timeout-seconds]
#
# Exit codes:
#   0 - Experiment completed successfully
#   1 - Experiment crashed
#   2 - Experiment timed out

set -euo pipefail

SCRIPT="${1:-train.py}"
TIMEOUT="${2:-300}"
EXPERIMENT_ID="${EXPERIMENT_ID:-exp-$(date +%s)}"
EXPERIMENT_DESC="${EXPERIMENT_DESC:-manual run}"

STATE_DIR=".autoresearch/experiments"
LOG_FILE="${STATE_DIR}/latest-run.log"

mkdir -p "${STATE_DIR}"

echo "=== Experiment: ${EXPERIMENT_ID} ==="
echo "Script:  ${SCRIPT}"
echo "Timeout: ${TIMEOUT}s"
echo "Desc:    ${EXPERIMENT_DESC}"
echo "==================================="

START_TIME=$(date +%s)

EXIT_CODE=0
timeout "${TIMEOUT}" uv run "${SCRIPT}" 2>&1 | tee "${LOG_FILE}" || EXIT_CODE=$?

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $EXIT_CODE -eq 124 ]; then
    echo ""
    echo "EXPERIMENT_STATUS: timeout"
    echo "EXPERIMENT_DURATION: ${DURATION}"
    exit 2
fi

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "EXPERIMENT_STATUS: crash"
    echo "EXPERIMENT_EXIT_CODE: ${EXIT_CODE}"
    echo "EXPERIMENT_DURATION: ${DURATION}"
    exit 1
fi

VAL_BPB=$(grep "^val_bpb:" "${LOG_FILE}" 2>/dev/null | tail -1 | awk '{print $2}' || echo "N/A")
PEAK_VRAM=$(grep "^peak_vram_mb:" "${LOG_FILE}" 2>/dev/null | tail -1 | awk '{print $2}' || echo "N/A")

echo ""
echo "EXPERIMENT_STATUS: done"
echo "EXPERIMENT_RESULT: ${EXPERIMENT_ID} val_bpb=${VAL_BPB} peak_vram_mb=${PEAK_VRAM}"
echo "EXPERIMENT_DURATION: ${DURATION}"
echo "EXPERIMENT_DESC: ${EXPERIMENT_DESC}"

exit 0
