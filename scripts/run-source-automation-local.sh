#!/bin/zsh
set -euo pipefail

cd /Users/kkabuto/dev/zac

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export ZAC_AUTOMATION_RETRY_BASE_MS="${ZAC_AUTOMATION_RETRY_BASE_MS:-1000}"
export ZAC_AUTOMATION_COMMAND_TIMEOUT_MS="${ZAC_AUTOMATION_COMMAND_TIMEOUT_MS:-180000}"
export ZAC_AUTOMATION_LOCAL_COMMAND_TIMEOUT_MS="${ZAC_AUTOMATION_LOCAL_COMMAND_TIMEOUT_MS:-240000}"

if [[ -z "${PNPM_BIN:-}" ]]; then
  PNPM_BIN="$(command -v pnpm || true)"
fi

if [[ -z "$PNPM_BIN" ]]; then
  echo "pnpm not found. Set PNPM_BIN or update PATH for the LaunchAgent." >&2
  exit 127
fi

log_dir="data/intake"
mkdir -p "$log_dir"

started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[$started_at] Zac source automation local runner starting"

runner_status=0
"$PNPM_BIN" exec node scripts/run-source-automation-local.mjs || runner_status=$?

finished_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[$finished_at] Zac source automation local runner finished"

exit "$runner_status"
