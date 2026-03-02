#!/bin/bash
# run vitest once and capture JSON output
npx vitest run --reporter json > vitest-results.json 2>&1
