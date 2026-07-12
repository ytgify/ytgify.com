#!/usr/bin/env bash

set -euo pipefail

source_page='app/studio/page.disabled.tsx'
test_page='app/studio/page.tsx'

if [[ -e "$test_page" ]]; then
  echo "Refusing to overwrite ${test_page}; the Studio route may already be enabled."
  exit 1
fi

cleanup() {
  rm -f "$test_page"
  if [[ "${YTGIFY_KEEP_STUDIO_BUILD:-0}" != '1' ]]; then
    rm -rf .next out
  fi
}

trap cleanup EXIT INT TERM
cp "$source_page" "$test_page"
"$@"
