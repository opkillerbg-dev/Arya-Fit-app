#!/usr/bin/env bash
# Runs every tests/*_test.py (Playwright) one after another. Optional job: it reports, it does not block the APK.
#  - one test failing never stops the others
#  - boot_ui_test.py is retried once (known timing flake on slow machines) before it counts as failed
#  - each test has a time limit so a hang cannot freeze the job
# Writes logs to $LOGS_DIR (default ui-logs/) and a table to the GitHub job summary. Exits 1 if anything failed.
# Run from the repo root. PY = python with playwright installed (default python3).
PY="${PY:-python3}"; DIR="${TESTS_DIR:-tests}"; LOGS="${LOGS_DIR:-ui-logs}"; LIMIT="${TEST_TIMEOUT:-300}"
mkdir -p "$LOGS"
run_one() { timeout "$LIMIT" "$PY" "$1" > "$2" 2>&1; }
pass=0; fail=0; failed=""
rows="| Test | Result | Seconds |
|---|---|---|"
for t in "$DIR"/*_test.py; do
  [ -e "$t" ] || continue
  n=$(basename "$t" .py); s=$(date +%s); res="PASS"
  if ! run_one "$t" "$LOGS/$n.log"; then
    if [ "$n" = "boot_ui_test" ]; then
      mv "$LOGS/$n.log" "$LOGS/$n.try1.log"
      if run_one "$t" "$LOGS/$n.log"; then res="PASS (passed on retry)"; else res="FAIL"; fi
    else
      res="FAIL"
    fi
  fi
  e=$(( $(date +%s) - s ))
  echo "$res  $n  (${e}s)"
  if [ "$res" = "FAIL" ]; then
    tail -n 15 "$LOGS/$n.log" | sed 's/^/    /'
    fail=$((fail+1)); failed="$failed $n"; rows="$rows
| $n | **FAIL** | $e |"
  else
    pass=$((pass+1)); rows="$rows
| $n | $res | $e |"
  fi
done
echo "UI tests: $pass passed, $fail failed${failed:+ ->$failed}"
{
  echo "### UI tests (optional, does not block the APK): $pass passed, $fail failed"; echo; echo "$rows"; echo
} > "$LOGS/summary.md"
[ -n "$GITHUB_STEP_SUMMARY" ] && cat "$LOGS/summary.md" >> "$GITHUB_STEP_SUMMARY"
[ "$fail" -eq 0 ] && [ "$pass" -gt 0 ]
