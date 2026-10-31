import type { PDFFont } from "pdf-lib";
import {
  COLOR,
  CONTENT_W,
  MARGIN_X,
} from "./asset-sheet.const.js";

export interface TableColumn {
  title: string;
  ratio: number;
}

/**
 * Dependencias mínimas que necesita el renderizador de tablas.
 * El contexto mantiene la paginación y el estado del documento en render.ts.
 */
export interface TableContext {
  getY(): number;
  setY(value: number): void;
  ensure(height: number): boolean;

  rect(
    x: number,
    top: number,
    width: number,
    height: number,
    color: typeof COLOR.orange,
  ): void;

  text(
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont,
    color?: typeof COLOR.ink,
  ): void;

  wrap(
    value: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string[];

  clamp(lines: string[], max: number): string[];
  hline(top: number): void;
  note(message: string): void;

  regular: PDFFont;
  bold: PDFFont;
}

/**
 * Dibuja una tabla con encabezado repetido cuando continúa en otra página.
 * Las filas largas se ajustan al ancho de sus columnas y se limitan a 10 líneas.
 */
export function renderTable(
  context: TableContext,
  columns: TableColumn[],
  rows: string[][],
  emptyMessage: string,
): void {
  const {
    getY,
    setY,
    ensure,
    rect,
    text,
    wrap,
    clamp,
    hline,
    note,
    regular,
    bold,
  } = context;

  if (rows.length === 0) {
    note(emptyMessage);
    return;
  }

  const fontSize = 8.5;
  const lineHeight = 11.5;
  const paddingX = 5;
  const paddingY = 4.5;
  const headerHeight = 20;
  const maxLines = 10;

  const columnWidths = columns.map(
    (column) => column.ratio * CONTENT_W,
  );

  const drawHeader = (): void => {
    const currentY = getY();

    rect(
      MARGIN_X,
      currentY,
      CONTENT_W,
      headerHeight,
      COLOR.orangeTint,
    );

    let x = MARGIN_X;

    columns.forEach((column, index) => {
      text(
        column.title,
        x + paddingX,
        currentY + 5.5,
        fontSize,
        bold,
        COLOR.orangeDark,
      );

      x += columnWidths[index] ?? 0;
    });

    setY(currentY + headerHeight);
  };

  const layoutRow = (row: string[]): string[][] =>
    columns.map((_, index) =>
      clamp(
        wrap(
          row[index] ?? "",
          regular,
          fontSize,
          (columnWidths[index] ?? 0) - paddingX * 2,
        ),
        maxLines,
      ),
    );

  const getRowHeight = (cells: string[][]): number =>
    Math.max(1, ...cells.map((lines) => lines.length)) *
      lineHeight +
    paddingY * 2;

  // Comprueba que el encabezado y la primera fila puedan comenzar juntos.
  const firstRow = layoutRow(rows[0] ?? []);
  ensure(headerHeight + getRowHeight(firstRow) + 4);
  drawHeader();

  rows.forEach((row, rowIndex) => {
    const cells =
      rowIndex === 0 ? firstRow : layoutRow(row);

    const rowHeight = getRowHeight(cells);

    // Si la fila no cabe, ensure abre una página y se repite el encabezado.
    if (ensure(rowHeight)) {
      drawHeader();
    }

    const currentY = getY();

    // Filas alternadas para facilitar la lectura.
    if (rowIndex % 2 === 1) {
      rect(
        MARGIN_X,
        currentY,
        CONTENT_W,
        rowHeight,
        COLOR.zebra,
      );
    }

    let x = MARGIN_X;

    cells.forEach((lines, columnIndex) => {
      lines.forEach((line, lineIndex) => {
        text(
          line,
          x + paddingX,
          currentY + paddingY + lineIndex * lineHeight,
          fontSize,
          regular,
          COLOR.ink,
        );
      });

      x += columnWidths[columnIndex] ?? 0;
    });

    const nextY = currentY + rowHeight;
    setY(nextY);
    hline(nextY);
  });

  setY(getY() + 8);
}
