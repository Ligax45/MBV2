#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-}" = "true" ]; then
  node dist/run-migrations.js
fi

exec node dist/main.js
