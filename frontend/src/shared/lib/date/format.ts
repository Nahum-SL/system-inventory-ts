const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** "2026-11-02" → "2 nov 2026". Sin `Date`, para que la zona horaria no cambie el día. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : iso;
}

/** "AVALOS FLORES RONI" → "Avalos Flores Roni". */
export const titleCase = (text: string) =>
  text
    .toLocaleLowerCase("es")
    .replace(/(^|\s)\S/g, (c) => c.toLocaleUpperCase("es"));
