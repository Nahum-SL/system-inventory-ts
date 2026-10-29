export type CsvCell = string | number | null | undefined;

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => CsvCell;
}

/** Celdas de texto que Excel interpretaría como fórmula. */
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return "";

  let text = String(cell);

  // Solo se neutraliza el texto: un número negativo es un número, no una fórmula.
  if (typeof cell === "string" && FORMULA_START.test(text)) text = `'${text}`;

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV con BOM UTF-8 (para Excel) y saltos CRLF. */
export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const lines = [
    columns.map((c) => escapeCell(c.header)).join(","),
    ...rows.map((row) =>
      columns.map((c) => escapeCell(c.value(row))).join(","),
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
