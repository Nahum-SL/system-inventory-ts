#!/usr/bin/env bash
# Respaldo de la carpeta de imágenes de los activos (IMAGES_DIR).
#
# - rsync -a SIN --delete: solo copia lo nuevo. Si una foto se elimina o se reemplaza,
#   su copia anterior permanece en el respaldo (los nombres son UUID inmutables).
# - Ejecútalo DESPUÉS del respaldo de la base, así la carpeta contiene todas las imágenes
#   que el respaldo de la base menciona.
# - Código 24 de rsync (un archivo desapareció durante la copia) se trata como aviso.
# - Al final verifica que el respaldo tenga al menos tantos archivos como el origen.
#
# Uso:
#   IMAGES_DIR=~/data/inventario-imagenes ./backup-images.sh
#   ./backup-images.sh --source /ruta/origen --dest /ruta/respaldo
#
# Variables opcionales: IMAGES_DIR, BACKUP_IMG_DEST, BACKUP_IMG_LOG

set -Eeuo pipefail
umask 077

SOURCE="${IMAGES_DIR:-$HOME/data/inventario-imagenes}"
DEST="${BACKUP_IMG_DEST:-$HOME/backups/imagenes}"
LOG="${BACKUP_IMG_LOG:-$HOME/backups/logs/images-backup.log}"

while (($#)); do
  case "$1" in
    --source) SOURCE="${2:?Falta el origen}"; shift ;;
    --dest)   DEST="${2:?Falta el destino}"; shift ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
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
fail() { log "ERROR: $*"; exit 1; }
trap 'log "ERROR: fallo inesperado en la línea $LINENO."; exit 1' ERR

command -v rsync >/dev/null || fail "No se encontró rsync (sudo apt install rsync)."
[[ -d "$SOURCE" ]] || fail "No existe la carpeta de imágenes: $SOURCE"

SOURCE="$(realpath "$SOURCE")"
DEST="$(realpath "$DEST")"
[[ "$SOURCE" != "$DEST" ]] || fail "Origen y destino son la misma carpeta."
case "$DEST/" in "$SOURCE"/*) fail "El destino está dentro del origen." ;; esac

exec 9>"$DEST/.backup.lock"
flock -n 9 || fail "Ya hay otro respaldo de imágenes en ejecución."

log "Inicio: $SOURCE -> $DEST"

rc=0
out="$(rsync -a --stats "$SOURCE"/ "$DEST"/ 2>&1)" || rc=$?

case "$rc" in
  0)  ;;
  24) log "AVISO: algunos archivos desaparecieron durante la copia (rsync 24)." ;;
  *)  printf '%s\n' "$out" >>"$LOG"; fail "rsync falló con código $rc (detalle en $LOG)." ;;
esac

copied="$(grep -E 'Number of (regular )?files transferred' <<<"$out" | grep -oE '[0-9,]+$' | head -n1 || true)"
n_src="$(find "$SOURCE" -type f ! -name '.backup.lock' | wc -l)"
n_dst="$(find "$DEST"   -type f ! -name '.backup.lock' | wc -l)"

((n_dst >= n_src)) || fail "El respaldo tiene menos archivos ($n_dst) que el origen ($n_src)."

log "Listo. Copiados ahora: ${copied:-?}. Origen: $n_src archivos. Respaldo: $n_dst archivos."
exit 0