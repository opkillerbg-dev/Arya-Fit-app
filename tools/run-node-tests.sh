#!/usr/bin/env bash
# Runs every tests/*.test.js with node, one after another, never stopping at the first failure.
# Prints a PASS/FAIL line per file (and the tail of the log of each failure), appends a table to the
# GitHub job summary when available, and exits 1 if anything failed. Run from the repo root.
DIR="${TESTS_DIR:-tests}"; LOGS="${LOGS_DIR:-/tmp/node-test-logs}"
mkdir -p "$LOGS"
pass=0; fail=0; failed=""
rows="| Test | Result |
|---|---|"
for t in "$DIR"/*.test.js; do
  [ -e "$t" ] || continue
  n=$(basename "$t")
  if timeout 120 node "$t" > "$LOGS/$n.log" 2>&1; then
    echo "PASS $n"; pass=$((pass+1)); rows="$rows
| $n | PASS |"
  else
    echo "FAIL $n"; tail -n 20 "$LOGS/$n.log" | sed 's/^/    /'
    fail=$((fail+1)); failed="$failed $n"; rows="$rows
| $n | **FAIL** |"
  fi
done
echo "Node unit tests: $pass passed, $fail failed${failed:+ ->$failed}"
if [ -n "$GITHUB_STEP_SUMMARY" ]; then
  { echo "### Node unit tests (required): $pass passed, $fail failed"; echo; echo "$rows"; echo; } >> "$GITHUB_STEP_SUMMARY"
fi
[ "$fail" -eq 0 ] && [ "$pass" -gt 0 ]
