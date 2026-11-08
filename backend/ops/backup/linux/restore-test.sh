#!/usr/bin/env bash
# Prueba de restauración: restaura un respaldo en un contenedor TEMPORAL y compara
# el número de filas de cada tabla con la base viva.
#
# - NUNCA toca el contenedor/volumen real: crea 'mariadb-restore-test' (datos en tmpfs, sin
#   puertos publicados) y lo destruye al terminar.
# - Usa la misma imagen y los mismos .cnf (charset/collation) que el contenedor real.
# - Si la base viva recibió cambios después del respaldo, las diferencias son esperables.
#
# Uso:
#   ./restore-test.sh                      # el respaldo más reciente de system_inventory_prod
#   ./restore-test.sh ~/backups/mariadb/system_inventory_prod_2026-11-08_130000.sql.gz
#
# Códigos de salida: 0 = restauración correcta y conteos iguales; 2 = conteos distintos; 1 = error.

set -Eeuo pipefail
umask 077

DATABASE="${BACKUP_DB:-system_inventory_prod}"
DEST="${BACKUP_DEST:-$HOME/backups/mariadb}"
CONTAINER="${BACKUP_CONTAINER:-mariadb}"
CNF="${BACKUP_CNF:-/etc/backup/backup.cnf}"
CONF_D="${RESTORE_CONF_D:-$HOME/infra/mariadb/conf.d}"
TEST="mariadb-restore-test"

FILE="${1:-}"
if [[ -z "$FILE" ]]; then
  FILE="$(find "$DEST" -maxdepth 1 -type f -name "${DATABASE}_????-??-??_??????.sql.gz" | sort | tail -n1)"
fi
[[ -n "$FILE" && -f "$FILE" ]] || { echo "No hay respaldo que probar." >&2; exit 1; }
[[ "$DATABASE" =~ ^[A-Za-z0-9_]+$ ]] || { echo "Nombre de base no válido." >&2; exit 1; }

cleanup() { docker rm -f "$TEST" >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'echo "ERROR: fallo inesperado en la línea $LINENO." >&2; exit 1' ERR
cleanup

echo "Respaldo: $FILE"
if [[ -f "$FILE.sha256" ]]; then
  (cd "$(dirname "$FILE")" && sha256sum -c "$(basename "$FILE").sha256") || { echo "SHA-256 no coincide." >&2; exit 1; }
fi
gzip -t "$FILE"

IMAGE="$(docker inspect -f '{{.Config.Image}}' "$CONTAINER")"
PW="$(head -c 24 /dev/urandom | base64 | tr -d '=+/')"
echo "Imagen: $IMAGE (la misma del contenedor real)"

mounts=()
[[ -d "$CONF_D" ]] && mounts=(-v "$CONF_D:/etc/mysql/conf.d:ro")

docker run -d --name "$TEST" --tmpfs /var/lib/mysql \
  -e MARIADB_ROOT_PASSWORD="$PW" -e TZ=America/Lima \
  --health-cmd 'healthcheck.sh --connect --innodb_initialized' \
  --health-interval 2s --health-retries 60 --health-start-period 5s \
  "${mounts[@]}" "$IMAGE" >/dev/null

echo -n "Esperando al servidor temporal"
for _ in $(seq 1 90); do
  [[ "$(docker inspect -f '{{.State.Health.Status}}' "$TEST")" == "healthy" ]] && break
  echo -n "."; sleep 2
done
echo
[[ "$(docker inspect -f '{{.State.Health.Status}}' "$TEST")" == "healthy" ]] \
  || { echo "El servidor temporal no arrancó." >&2; exit 1; }

# Si el volcado no trae CREATE DATABASE (modo traslado), la base se crea antes.
has_create="$(gzip -dc "$FILE" | grep -c '^CREATE DATABASE' || true)"
dbarg=()
if ((has_create == 0)); then
  docker exec -e MYSQL_PWD="$PW" "$TEST" mariadb -uroot \
    -e "CREATE DATABASE \`$DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  dbarg=("$DATABASE")
fi

echo "Restaurando..."
gzip -dc "$FILE" | docker exec -i -e MYSQL_PWD="$PW" "$TEST" mariadb -uroot "${dbarg[@]}"

# Conteo exacto de filas por tabla. $@ = comando mariadb completo (con -N -B).
table_counts() {
  local tables sql="" t
  tables="$("$@" -e "SELECT table_name FROM information_schema.tables WHERE table_schema='${DATABASE}' AND table_type='BASE TABLE' ORDER BY table_name")"
  while IFS= read -r t; do
    [[ -z "$t" ]] && continue
    sql+="${sql:+ UNION ALL }SELECT '${t}' AS t, COUNT(*) AS n FROM \`${DATABASE}\`.\`${t}\`"
  done <<<"$tables"
  [[ -n "$sql" ]] || { echo "(sin tablas)"; return; }
  "$@" -e "$sql ORDER BY t"
}

restored="$(table_counts docker exec -e MYSQL_PWD="$PW" "$TEST" mariadb -uroot -N -B)"
live="$(table_counts docker exec "$CONTAINER" mariadb --defaults-extra-file="$CNF" -N -B)"

echo
echo "Servidor temporal: $(docker exec "$TEST" mariadb --version)"
echo "Filas por tabla (restaurado):"
echo "$restored" | column -t
[[ "$restored" != "(sin tablas)" ]] || { echo "La restauración no creó tablas." >&2; exit 1; }

echo
if diff <(echo "$live") <(echo "$restored") >/dev/null; then
  echo "OK: los conteos coinciden con la base viva."
else
  echo "DIFERENCIAS respecto a la base viva (live < / restaurado >):"
  diff <(echo "$live") <(echo "$restored") || true
  echo "Si la base viva cambió después del respaldo, es normal; si no, investiga."
  exit 2
fi