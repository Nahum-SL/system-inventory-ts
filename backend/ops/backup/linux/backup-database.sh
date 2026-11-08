#!/usr/bin/env bash
# Respaldo de la base de datos MariaDB (contenedor Docker) de system-inventory-ts.
#
# - Un archivo .sql.gz independiente por ejecución, con su .sha256.
# - mariadb-dump se ejecuta DENTRO del contenedor: cliente y servidor son de la misma versión.
# - Credenciales en un archivo .cnf montado en el contenedor (usuario de solo lectura).
# - Escribe a un .tmp, verifica y recién entonces lo publica con mv.
# - Rotación: borra respaldos de más de KEEP_DAYS días, pero SIEMPRE conserva los KEEP_MIN más recientes.
# - flock evita dos ejecuciones simultáneas. No toca la base original.
#
# Uso:
#   ./backup-database.sh                       # base system_inventory_prod, con CREATE DATABASE
#   ./backup-database.sh --sin-crear-base      # modo traslado (sin CREATE DATABASE / USE)
#   ./backup-database.sh --database system_inventory --dest /tmp/pruebas
#
# Variables opcionales: BACKUP_DB, BACKUP_DEST, BACKUP_LOG, BACKUP_CONTAINER, BACKUP_CNF,
#                       BACKUP_KEEP_DAYS, BACKUP_KEEP_MIN, BACKUP_MIN_BYTES

set -Eeuo pipefail
umask 077

DATABASE="${BACKUP_DB:-system_inventory_prod}"
DEST="${BACKUP_DEST:-$HOME/backups/mariadb}"
LOG="${BACKUP_LOG:-$HOME/backups/logs/database-backup.log}"
CONTAINER="${BACKUP_CONTAINER:-mariadb}"
CNF="${BACKUP_CNF:-/etc/backup/backup.cnf}"      # ruta DENTRO del contenedor
KEEP_DAYS="${BACKUP_KEEP_DAYS:-30}"
KEEP_MIN="${BACKUP_KEEP_MIN:-7}"
MIN_BYTES="${BACKUP_MIN_BYTES:-1024}"
SIN_CREAR_BASE=0

while (($#)); do
  case "$1" in
    --sin-crear-base) SIN_CREAR_BASE=1 ;;
    --database) DATABASE="${2:?Falta el nombre de la base}"; shift ;;
    --dest)     DEST="${2:?Falta la carpeta de destino}"; shift ;;
    -h|--help)  sed -n '2,19p' "$0"; exit 0 ;;
    *) echo "Opción desconocida: $1" >&2; exit 2 ;;
  esac
  shift
done

mkdir -p "$DEST" "$(dirname "$LOG")"

log() {
  local line
  line="$(date '+%Y-%m-%d %H:%M:%S')  $*"
  echo "$line"
  echo "$line" >>"$LOG"
}

TMP=""
ERRF=""
cleanup() {
  [[ -n "$TMP" ]] && rm -f -- "$TMP"
  [[ -n "$ERRF" ]] && rm -f -- "$ERRF"
  return 0
}
fail() { log "ERROR: $*"; exit 1; }
trap 'log "ERROR: fallo inesperado en la línea $LINENO."; exit 1' ERR
trap cleanup EXIT

# ---------- Validaciones ----------
[[ "$DATABASE" =~ ^[A-Za-z0-9_]+$ ]] || fail "Nombre de base no válido: $DATABASE"
command -v docker >/dev/null || fail "No se encontró docker."
command -v flock  >/dev/null || fail "No se encontró flock (paquete util-linux)."
[[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" == "true" ]] \
  || fail "El contenedor '$CONTAINER' no está en ejecución."
docker exec "$CONTAINER" test -r "$CNF" \
  || fail "No se puede leer $CNF dentro del contenedor (¿falta el volumen en compose.yaml?)."

exec 9>"$DEST/.backup.lock"
flock -n 9 || fail "Ya hay otro respaldo en ejecución."

# ---------- Respaldo ----------
STAMP="$(date '+%Y-%m-%d_%H%M%S')"
FINAL="$DEST/${DATABASE}_${STAMP}.sql.gz"
TMP="$FINAL.tmp"
ERRF="$(mktemp)"

log "========================================"
log "Inicio del respaldo MariaDB."
log "Base de datos: $DATABASE  (contenedor: $CONTAINER)"
log "Destino: $FINAL"

args=(--defaults-extra-file="$CNF"          # debe ir primero
      --single-transaction --quick --routines --triggers --events
      --hex-blob --no-tablespaces --default-character-set=utf8mb4)

if ((SIN_CREAR_BASE)); then
  log "Modo traslado: sin CREATE DATABASE ni USE."
  args+=(--skip-add-drop-table "$DATABASE")
else
  log "Modo respaldo completo: incluye CREATE DATABASE."
  args+=(--databases "$DATABASE")
fi

# pipefail: si mariadb-dump falla a mitad de la tubería, el respaldo se descarta.
if ! docker exec "$CONTAINER" mariadb-dump "${args[@]}" 2>"$ERRF" | gzip -6 >"$TMP"; then
  while IFS= read -r l; do log "mariadb-dump: $l"; done <"$ERRF"
  fail "mariadb-dump falló."
fi
while IFS= read -r l; do log "mariadb-dump (aviso): $l"; done <"$ERRF"

# ---------- Verificación ----------
gzip -t "$TMP" || fail "El archivo comprimido está dañado."

size="$(stat -c %s "$TMP")"
((size >= MIN_BYTES)) || fail "El respaldo es sospechosamente pequeño ($size bytes)."

gzip -dc "$TMP" | tail -n 5 | grep -q '^-- Dump completed' \
  || fail "El volcado no termina con '-- Dump completed' (incompleto)."

tables="$(gzip -dc "$TMP" | grep -c '^CREATE TABLE' || true)"
((tables > 0)) || fail "El volcado no contiene ninguna tabla."

# ---------- Publicar ----------
mv -- "$TMP" "$FINAL"
TMP=""
(cd "$DEST" && sha256sum "$(basename "$FINAL")" >"$(basename "$FINAL").sha256")

log "Respaldo completado correctamente."
log "Archivo: $(basename "$FINAL")"
log "Tablas: $tables  ·  Tamaño: $(du -h "$FINAL" | cut -f1)"

# ---------- Rotación (solo tras un respaldo verificado) ----------
cutoff="$(date -d "-${KEEP_DAYS} days" +%s)"
mapfile -t all < <(find "$DEST" -maxdepth 1 -type f \
  -name "${DATABASE}_????-??-??_??????.sql.gz" | sort -r)
removed=0
for i in "${!all[@]}"; do
  ((i < KEEP_MIN)) && continue
  f="${all[$i]}"
  if (($(stat -c %Y "$f") < cutoff)); then
    rm -f -- "$f" "$f.sha256"
    removed=$((removed + 1))
  fi
done
log "Rotación: ${#all[@]} respaldos, $removed eliminados (> ${KEEP_DAYS} días, conservando los ${KEEP_MIN} más recientes)."
log "========================================"
exit 0