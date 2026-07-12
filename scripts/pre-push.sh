#!/usr/bin/env bash

set -uo pipefail

failed=0

run_check() {
  local label="$1"
  shift

  echo
  echo "==> ${label}"
  if "$@"; then
    echo "PASS: ${label}"
  else
    echo "FAIL: ${label}"
    failed=1
  fi
}

branch=$(git branch --show-current)
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  merged_prs=$(gh pr list --head "$branch" --state merged --json number --jq '.[].number' 2>/dev/null || true)
  if [[ -n "$merged_prs" ]]; then
    echo "ERROR: Branch '${branch}' already has merged PR(s): ${merged_prs}"
    echo "Create a fresh branch from origin/main before pushing."
    exit 1
  fi
fi

run_check "ESLint" npm run lint
run_check "Prettier" npm run format:check
run_check "TypeScript" npm run typecheck
run_check "Knip production graph" npm run knip:production
run_check "CI path boundaries" npm run verify:ci-boundaries
run_check "Unit tests" npm run test:unit
run_check "Production build" npm run build
run_check "Public tool production routes" npm run verify:public-tool

if [[ "$failed" -ne 0 ]]; then
  echo
  echo "Pre-push validation failed."
  exit 1
fi

echo
echo "Pre-push validation passed."
