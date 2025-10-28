#!/usr/bin/env bash
set -euo pipefail

# Basispfade
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# compose-Datei auto-detektion (.yml oder .yaml)
if [[ -f "$PROJECT_DIR/docker-compose.yml" ]]; then
  COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
elif [[ -f "$PROJECT_DIR/docker-compose.yaml" ]]; then
  COMPOSE_FILE="$PROJECT_DIR/docker-compose.yaml"
else
  echo "Fehler: keine docker-compose.{yml,yaml} im Projektstamm gefunden: $PROJECT_DIR" >&2
  exit 1
fi

EXPORT_DIR="$SCRIPT_DIR/export"

echo "[1/5] compose down"
docker compose -f "$COMPOSE_FILE" down

echo "[2/5] postgres starten"
docker compose -f "$COMPOSE_FILE" up -d postgres

echo "[3/5] warte auf postgres"
# Warte bis pg_isready erfolgreich ist
for i in {1..20}; do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U root >/dev/null 2>&1; then
    echo "postgres bereit"
    break
  fi
  sleep 3
  if [[ $i -eq 20 ]]; then
    echo "postgres nicht bereit" >&2
    exit 1
  fi
done

echo "[4/5] export-verzeichnis vorbereiten"
mkdir -p "$EXPORT_DIR"

echo "[5/5] realm 'todo' in eine Datei exportieren"
OUT="$EXPORT_DIR/todo-realm.json"
docker compose -f "$COMPOSE_FILE" run --rm \
  -v "$EXPORT_DIR:/opt/keycloak/data/export" \
  keycloak \
  export \
    --realm todo \
    --file /opt/keycloak/data/export/todo-realm.json \
    --users same_file

echo "Export abgeschlossen: $OUT"