import { describe, expect, it } from "vitest";
import { toCsv } from "../../src/shared/utils/csv.js";

type Row = { a: string | number | null };
const columns = [{ header: "Dato", value: (r: Row) => r.a }];

/** Líneas sin el BOM ni la línea final vacía. */
const lines = (csv: string) => csv.slice(1).split("\r\n").slice(0, -1);

describe("toCsv", () => {
  it("empieza con BOM UTF-8, separa con CRLF y conserva las tildes", () => {
    const csv = toCsv(columns, [{ a: "Cañería" }]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(lines(csv)).toEqual(["Dato", "Cañería"]);
  });

  it("entrecomilla comas, comillas y saltos de línea", () => {
    expect(lines(toCsv(columns, [{ a: 'di "hola", amigo' }]))[1]).toBe(
      '"di ""hola"", amigo"',
    );
    expect(lines(toCsv(columns, [{ a: "uno\ndos" }]))[1]).toBe('"uno\ndos"');
  });

  it("neutraliza texto que Excel tomaría como fórmula", () => {
    for (const formula of ["=1+1", "+cmd", "-2+3", "@SUM(A1)"]) {
      expect(lines(toCsv(columns, [{ a: formula }]))[1]).toBe(`'${formula}`);
    }
  });

  it("no altera números (ni negativos) ni valores vacíos", () => {
    expect(
      lines(toCsv(columns, [{ a: 12.5 }, { a: null }, { a: -3 }])),
    ).toEqual(["Dato", "12.5", "", "-3"]);
  });
});
