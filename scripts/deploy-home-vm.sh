#!/usr/bin/env bash
# Manual deploy on the home-server Docker stack. No CI/CD - run this by hand
# over SSH on the host itself after a git push:
#   bash scripts/deploy-home-vm.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "-- Pull latest --"
git stash push --include-untracked -m "pre-deploy-$(date +%s)" || true
git fetch origin
git pull --ff-only origin master

echo "-- Build + restart --"
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

echo "-- Prune dangling images --"
docker image prune -f

echo "-- Health check --"
sleep 3
PORT="3001"
if [ -f .env ]; then
  ENV_PORT="$(grep -E '^NUCLEI_HOST_PORT=' .env | cut -d= -f2)"
  [ -n "$ENV_PORT" ] && PORT="$ENV_PORT"
fi
curl -sf "http://localhost:${PORT}/" >/dev/null \
  && echo "OK: frontend responding on :${PORT}" \
  || echo "WARN: frontend health check failed - check: docker compose -f docker-compose.prod.yml logs"

echo "Deployed at $(date)"
