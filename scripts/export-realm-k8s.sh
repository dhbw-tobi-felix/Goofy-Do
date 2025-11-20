#!/usr/bin/env bash
set -euo pipefail

# Aufruf:
#   ./export-realm-k8s.sh <REALM_NAME> [LOCAL_TARGET_DIR] [NAMESPACE] [APP_LABEL]
#
# Beispiel:
#   ./export-realm-k8s.sh todo ./export goofydo keycloak

REALM="${1:?REALM_NAME fehlt}"
TARGET_DIR="${2:-./keycloak-export}"
NAMESPACE="${3:-goofydo}"
APP_LABEL="${4:-keycloak}"

EXPORT_DIR_IN_CONTAINER="/opt/keycloak/data/export"
EXPORT_FILE_IN_CONTAINER="${EXPORT_DIR_IN_CONTAINER}/${REALM}-realm.json"

echo "Verwende Namespace: $NAMESPACE"
echo "Suche Keycloak-Pod mit Label app=$APP_LABEL …"

POD="$(
  kubectl get pod \
    -n "$NAMESPACE" \
    -l "app=${APP_LABEL}" \
    -o jsonpath='{.items[0].metadata.name}'
)"

if [ -z "${POD:-}" ]; then
  echo "Kein Pod mit Label app=${APP_LABEL} im Namespace ${NAMESPACE} gefunden" >&2
  exit 1
fi

echo "Gefundener Pod: $POD"
echo "Erstelle Export-Verzeichnis im Container: $EXPORT_DIR_IN_CONTAINER"

kubectl exec -n "$NAMESPACE" "$POD" -- mkdir -p "$EXPORT_DIR_IN_CONTAINER"

echo "Starte Keycloak-Export für Realm '${REALM}' (Single-File) …"

set +e
kubectl exec -n "$NAMESPACE" "$POD" -- /opt/keycloak/bin/kc.sh export \
  --realm="$REALM" \
  --file="$EXPORT_FILE_IN_CONTAINER" \
  --users=same_file
EXPORT_RC=$?
set -e

if [ "$EXPORT_RC" -ne 0 ]; then
  echo "Warnung: kc.sh export ist mit Exit-Code $EXPORT_RC zurückgekehrt."
  echo "Wenn oben 'Export finished successfully' stand, war der Export trotzdem erfolgreich."
fi

echo "Kopiere Export-Datei aus dem Container nach lokal: $TARGET_DIR"

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

LOCAL_FILE="${TARGET_DIR}/${REALM}-realm.json"

kubectl exec -n "$NAMESPACE" "$POD" -- /bin/sh -c "cat \"$EXPORT_FILE_IN_CONTAINER\"" > "$LOCAL_FILE"

echo "Export abgeschlossen: $LOCAL_FILE"