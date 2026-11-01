import type { PDFFont } from "pdf-lib";

// ============================================================
// Utilidades de texto
// ============================================================

/** "2026-10-30" o "2026-10-30 14:20:00" -> "30/10/2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

/** "2026-10-30 14:20:00" -> "30/10/2026 14:20" */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : formatDate(value);
}

/** Fecha y hora actuales en Lima, para "Generado el ...". */
export function formatNowLima(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
}

/**
 * Las fuentes estándar del PDF solo cubren Latin-1 (tildes y ñ sí; emojis no).
 * Un carácter fuera de ese juego haría fallar la generación, así que se
 * reemplaza por "?" en vez de tumbar el informe por un dato escrito por un usuario.
 */
export function makeSanitizer(font: PDFFont) {
  const cache = new Map<string, boolean>();
  const encodable = (ch: string): boolean => {
    let ok = cache.get(ch);
    if (ok === undefined) {
      try {
        font.encodeText(ch);
        ok = true;
      } catch {
        ok = false;
      }
      cache.set(ch, ok);
    }
    return ok;
  };

  return (input: string): string =>
    Array.from(
      input
        .normalize("NFC")
        // Selectores de variación y uniones invisibles (típicos de los emojis): se descartan.
        .replace(/[​-‍︀-️]/g, "")
        .replace(/[\t\r]/g, " "),
    )
      .map((ch) => (ch === "\n" || encodable(ch) ? ch : "?"))
      .join("")
      .replace(/[\u200B-\u200D\uFE00-\uFE0F]/g, "")
}
