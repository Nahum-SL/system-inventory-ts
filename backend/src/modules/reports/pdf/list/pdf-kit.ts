import {
  rgb,
  type PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import {
  COLOR,
  FOOTER_H,
  HEADER_H,
  MARGIN_X,
  PAGE_H,
  PAGE_W,
} from "../sheet/asset-sheet.const.js";
import { makeSanitizer } from "../sheet/asset-sheet.helper.js";

type Color = ReturnType<typeof rgb>;

export interface KitFonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
}

/**
 * Primitivas de dibujo compartidas por los informes PDF (A4, `y` desde ARRIBA).
 * Mantiene la lista de páginas y la página actual.
 */
export function createKit(pdf: PDFDocument, fonts: KitFonts) {
  const { regular, bold } = fonts;
  const safe = makeSanitizer(regular);
  const pages: PDFPage[] = [];
  let page!: PDFPage;

  const width = (t: string, font: PDFFont, size: number) =>
    font.widthOfTextAtSize(t, size);

  const rect = (x: number, top: number, w: number, h: number, color: Color) =>
    page.drawRectangle({ x, y: PAGE_H - top - h, width: w, height: h, color });

  const strokeRect = (
    x: number,
    top: number,
    w: number,
    h: number,
    color: Color,
  ) =>
    page.drawRectangle({
      x,
      y: PAGE_H - top - h,
      width: w,
      height: h,
      borderColor: color,
      borderWidth: 0.75,
    });

  const hline = (
    top: number,
    x1 = MARGIN_X,
    x2 = PAGE_W - MARGIN_X,
    color = COLOR.line,
  ) =>
    page.drawLine({
      start: { x: x1, y: PAGE_H - top },
      end: { x: x2, y: PAGE_H - top },
      thickness: 0.75,
      color,
    });

  const text = (
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont,
    color: Color = COLOR.ink,
  ) =>
    page.drawText(value, {
      x,
      y: PAGE_H - top - size * 0.9,
      size,
      font,
      color,
    });

  const wrap = (
    raw: string,
    font: PDFFont,
    size: number,
    maxW: number,
  ): string[] => {
    const out: string[] = [];
    for (const paragraph of safe(raw).split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (width(candidate, font, size) <= maxW) {
          line = candidate;
          continue;
        }
        if (line) out.push(line);
        let rest = word;
        while (width(rest, font, size) > maxW && rest.length > 1) {
          let n = rest.length - 1;
          while (n > 1 && width(rest.slice(0, n), font, size) > maxW) n--;
          out.push(rest.slice(0, n));
          rest = rest.slice(n);
        }
        line = rest;
      }
      out.push(line);
    }
    return out;
  };

  const clamp = (lines: string[], max: number): string[] => {
    if (lines.length <= max) return lines;
    const cut = lines.slice(0, max);
    cut[max - 1] = `${cut[max - 1] ?? ""}...`;
    return cut;
  };

  const drawContained = (
    img: PDFImage,
    x: number,
    top: number,
    boxW: number,
    boxH: number,
  ) => {
    const scale = Math.min(boxW / img.width, boxH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    page.drawImage(img, {
      x: x + (boxW - w) / 2,
      y: PAGE_H - top - boxH + (boxH - h) / 2,
      width: w,
      height: h,
    });
  };

  /** Abre una página con la franja naranja, el logo y el rótulo de la derecha. */
  const addPage = (logo: PDFImage | null, title: string, subtitle: string) => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    pages.push(page);
    rect(0, 0, PAGE_W, HEADER_H, COLOR.orange);
    if (logo) {
      const logoH = 24;
      const logoW = Math.min(140, logoH * (logo.width / logo.height));
      drawContained(logo, MARGIN_X, (HEADER_H - logoH) / 2, logoW, logoH);
    } else {
      text("YONDA", MARGIN_X, 11, 20, bold, COLOR.white);
    }
    const sub = safe(subtitle);
    text(
      title,
      PAGE_W - MARGIN_X - width(title, bold, 9),
      11,
      9,
      bold,
      COLOR.white,
    );
    text(
      sub,
      PAGE_W - MARGIN_X - width(sub, regular, 10),
      24,
      10,
      regular,
      COLOR.white,
    );
  };

  /** Pie con "Generado..." y "Página x de y" en todas las páginas. Llamar al final. */
  const drawFooters = (generadoEn: string, generadoPor: string) => {
    const total = pages.length;
    pages.forEach((p, index) => {
      page = p;
      hline(PAGE_H - FOOTER_H);
      const right = `Página ${index + 1} de ${total}`;
      text(
        safe(`Generado el ${generadoEn} por ${generadoPor}`),
        MARGIN_X,
        PAGE_H - FOOTER_H + 9,
        8,
        regular,
        COLOR.muted,
      );
      text(
        right,
        PAGE_W - MARGIN_X - width(right, regular, 8),
        PAGE_H - FOOTER_H + 9,
        8,
        regular,
        COLOR.muted,
      );
    });
  };

  return {
    safe,
    width,
    rect,
    strokeRect,
    hline,
    text,
    wrap,
    clamp,
    drawContained,
    addPage,
    drawFooters,
    pageCount: () => pages.length,
  };
}
