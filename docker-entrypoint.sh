#!/bin/sh
# docker-entrypoint.sh
#
# Runs pending Payload database migrations, then starts the Next.js server.
# Payload CLI (payload migrate) uses tsx to execute the TypeScript config and
# migration files, so the full source tree must be present in the image.
#
# Environment variables honoured at startup:
#   PORT     – TCP port for Next.js  (default: 3000)
#   HOSTNAME – bind address           (default: 0.0.0.0)
#   SKIP_MIGRATIONS – set to "true" to skip the migration step (emergency use)

set -e

if [ "${SKIP_MIGRATIONS:-false}" = "true" ]; then
  echo "==> Skipping database migrations (SKIP_MIGRATIONS=true)"
else
  echo "==> Running database migrations..."
  node_modules/.bin/payload migrate
  echo "✓  Migrations complete"
fi

echo "==> Starting Next.js server..."
exec node_modules/.bin/next start \
  --port    "${PORT:-3000}" \
  --hostname "${HOSTNAME:-0.0.0.0}"

