#!/usr/bin/env bash
# Executes the given command via `asdf exec` when both `asdf` and a configured
# Node.js plugin are available. Falls back to running the command directly in
# environments (e.g. CI) where asdf is not installed.

set -euo pipefail

if command -v asdf >/dev/null 2>&1; then
  if asdf which node >/dev/null 2>&1; then
    if asdf exec "$@"; then
      exit 0
    else
      echo "asdf exec $* failed; retrying without asdf." >&2
    fi
  else
    echo "asdf detected but nodejs plugin/version is not configured; running $1 without asdf." >&2
  fi
fi

exec "$@"
