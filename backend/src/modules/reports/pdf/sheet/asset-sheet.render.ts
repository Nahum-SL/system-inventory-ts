import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
// TYPES
import type { AssetSheetData, SheetImage } from "./asset-sheet.types.js";
// CONSTANTS
import {
  COLOR,
  STATUS_STYLE,
  CONTENT_BOTTOM,
  CONTENT_TOP,
  CONTENT_W,
  FOOTER_H,
  HEADER_H,
  MARGIN_X,
  PAGE_H,
  PAGE_W,
} from "./asset-sheet.const.js";

import { renderTable } from "./asset-sheet.table.js";

// HELPERS
import {
  makeSanitizer,
  formatDate,
  formatDateTime,
} from "./asset-sheet.helper.js";

// ============================================================
// Renderizador
// ============================================================

export async function renderAssetSheet(
  data: AssetSheetData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Hoja de vida ${data.activo.codigoInventario}`);
  pdf.setAuthor("SYSTEM-INVENTORY");
  pdf.setCreator("SYSTEM-INVENTORY");
  pdf.setProducer("SYSTEM-INVENTORY");

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const safe = makeSanitizer(regular);

  // Una imagen dañada no debe impedir el informe: simplemente no se dibuja.
  const embed = async (img: SheetImage | null): Promise<PDFImage | null> => {
    if (!img) return null;
    try {
      return img.format === "png"
        ? await pdf.embedPng(img.bytes)
        : await pdf.embedJpg(img.bytes);
    } catch {
      return null;
    }
  };
  const photo = await embed(data.imagen);
  const logo = await embed(data.logo);

  const pages: PDFPage[] = [];
  let page: PDFPage;
  let y = CONTENT_TOP;

  // ---------- primitivas ----------
  const width = (text: string, font: PDFFont, size: number) =>
    font.widthOfTextAtSize(text, size);

  const rect = (
    x: number,
    top: number,
    w: number,
    h: number,
    color: ReturnType<typeof rgb>,
  ) =>
    page.drawRectangle({ x, y: PAGE_H - top - h, width: w, height: h, color });

  const strokeRect = (
    x: number,
    top: number,
    w: number,
    h: number,
    color: ReturnType<typeof rgb>,
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
    color = COLOR.ink,
  ) =>
    page.drawText(value, {
      x,
      y: PAGE_H - top - size * 0.9,
      size,
      font,
      color,
    });

  /** Parte el texto en líneas que quepan en `maxW` (respeta saltos de línea). */
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

  /** Dibuja una imagen dentro de una caja, centrada y sin deformarla. */
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

  // ---------- páginas ----------
  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    pages.push(page);
    y = CONTENT_TOP;

    rect(0, 0, PAGE_W, HEADER_H, COLOR.orange);

    if (logo) {
      // El logo es blanco sobre fondo transparente: va directo sobre la franja naranja.
      const logoH = 24;
      const logoW = Math.min(140, logoH * (logo.width / logo.height));
      drawContained(logo, MARGIN_X, (HEADER_H - logoH) / 2, logoW, logoH);
    } else {
      text("YONDA", MARGIN_X, 11, 20, bold, COLOR.white);
    }

    const title = "HOJA DE VIDA DEL ACTIVO";
    const code = safe(data.activo.codigoInventario);
    text(
      title,
      PAGE_W - MARGIN_X - width(title, bold, 9),
      11,
      9,
      bold,
      COLOR.white,
    );
    text(
      code,
      PAGE_W - MARGIN_X - width(code, regular, 10),
      24,
      10,
      regular,
      COLOR.white,
    );
  };

  /** Si no cabe `h` en la página actual, abre otra. Devuelve true si la abrió. */
  const ensure = (h: number): boolean => {
    if (y + h <= CONTENT_BOTTOM) return false;
    newPage();
    return true;
  };

  const sectionTitle = (title: string) => {
    ensure(48);
    y += 6;
    rect(MARGIN_X, y, 3.5, 15, COLOR.orange);
    text(title, MARGIN_X + 10, y + 1, 12, bold, COLOR.ink);
    y += 24;
  };

  const chip = (
    label: string,
    x: number,
    top: number,
    style: { fg: ReturnType<typeof rgb>; bg: ReturnType<typeof rgb> },
  ) => {
    const size = 8.5;
    const w = width(label, bold, size) + 14;
    rect(x, top, w, 17, style.bg);
    text(label, x + 7, top + 4.5, size, bold, style.fg);
    return w;
  };

  const note = (message: string) => {
    ensure(22);
    text(message, MARGIN_X, y, 9, italic, COLOR.muted);
    y += 20;
  };

  // ---------- contexto compartido para tablas ----------
  const tableContext = {
    getY: () => y,
    setY: (value: number) => {
      y = value;
    },
    ensure,
    rect,
    text,
    wrap,
    clamp,
    hline,
    note,
    regular,
    bold,
  };

  // ============================================================
  // Contenido
  // ============================================================
  newPage();

  const { activo } = data;

  // ----- Bloque superior: código, descripción y estados -----
  const textW = CONTENT_W;
  text(safe(activo.codigoInventario), MARGIN_X, y, 22, bold, COLOR.ink);

  text(safe(activo.codigoInventario), MARGIN_X, y, 22, bold, COLOR.ink);
  let leftY = y + 30;

  const descLines = clamp(wrap(activo.descripcion, regular, 11, textW), 4);
  descLines.forEach((line, i) =>
    text(line, MARGIN_X, leftY + i * 15, 11, regular, COLOR.ink),
  );
  leftY += descLines.length * 15 + 8;

  let chipX = MARGIN_X;
  chipX +=
    chip(
      STATUS_STYLE[activo.estado].label,
      chipX,
      leftY,
      STATUS_STYLE[activo.estado],
    ) + 6;
  if (activo.eliminado) {
    chip(STATUS_STYLE.baja.label, chipX, leftY, STATUS_STYLE.baja);
  } else {
    const key = data.asignacionActual ? "asignado" : "disponible";
    chip(STATUS_STYLE[key].label, chipX, leftY, STATUS_STYLE[key]);
  }
  leftY += 17;

  y = leftY + 14;

  // ----- Aviso de baja -----
  if (activo.eliminado) {
    const reason = activo.motivoEliminacion
      ? `Motivo: ${activo.motivoEliminacion}`
      : "Sin motivo registrado.";
    const lines = clamp(wrap(reason, regular, 9.5, CONTENT_W - 24), 4);
    const h = 34 + lines.length * 13;
    ensure(h + 8);
    rect(MARGIN_X, y, CONTENT_W, h, STATUS_STYLE.fuera_de_servicio.bg);
    rect(MARGIN_X, y, 4, h, STATUS_STYLE.fuera_de_servicio.fg);
    text(
      `ACTIVO DADO DE BAJA el ${formatDate(activo.fechaEliminacion)}`,
      MARGIN_X + 14,
      y + 9,
      10.5,
      bold,
      STATUS_STYLE.fuera_de_servicio.fg,
    );
    lines.forEach((line, i) =>
      text(line, MARGIN_X + 14, y + 26 + i * 13, 9.5, regular, COLOR.ink),
    );
    y += h + 14;
  }

  // ----- Foto + datos del activo -----
  const photoW = 190;
  const photoH = 142;
  const dataX = MARGIN_X + photoW + 22;
  const dataW = CONTENT_W - photoW - 22;

  ensure(photoH + 10);
  const rowsTop = y;

  if (photo) {
    strokeRect(MARGIN_X, y, photoW, photoH, COLOR.line);
    drawContained(photo, MARGIN_X + 2, y + 2, photoW - 4, photoH - 4);
  } else {
    rect(MARGIN_X, y, photoW, photoH, COLOR.emptyBox);
    strokeRect(MARGIN_X, y, photoW, photoH, COLOR.line);
    const label = "Sin imagen";
    text(
      label,
      MARGIN_X + (photoW - width(label, italic, 10)) / 2,
      y + photoH / 2 - 6,
      10,
      italic,
      COLOR.muted,
    );
  }

  const facts: Array<[string, string]> = [
    ["Marca", activo.marcaNombre],
    ["Categoría", activo.categoriaNombre],
    ["Área", activo.areaNombre],
    ["Fecha de ingreso", formatDate(activo.fechaIngreso)],
  ];

  let fy = rowsTop;
  for (const [label, value] of facts) {
    const lines = clamp(wrap(value, bold, 10, dataW - 105), 2);
    const h = Math.max(1, lines.length) * 13 + 11;
    text(label, dataX, fy + 6, 8.5, regular, COLOR.muted);
    lines.forEach((line, i) =>
      text(line, dataX + 105, fy + 5 + i * 13, 10, bold, COLOR.ink),
    );
    fy += h;
    hline(fy, dataX, PAGE_W - MARGIN_X);
  }

  y = Math.max(rowsTop + photoH, fy) + 10;

  // ----- Responsable actual -----
  sectionTitle("Responsable actual");
  if (data.asignacionActual) {
    const a = data.asignacionActual;
    ensure(46);
    const items: Array<[string, string]> = [
      ["Persona", a.personaNombre],
      ["Cargo", a.cargoNombre],
      ["Asignado desde", formatDate(a.fechaInicio)],
    ];
    const colW = CONTENT_W / 3;
    items.forEach(([label, value], i) => {
      const x = MARGIN_X + i * colW;
      text(label, x, y, 8.5, regular, COLOR.muted);
      clamp(wrap(value, bold, 10, colW - 10), 2).forEach((line, n) =>
        text(line, x, y + 13 + n * 13, 10, bold, COLOR.ink),
      );
    });
    y += 46;
  } else {
    note(
      activo.eliminado
        ? "Sin responsable asignado."
        : "Disponible: sin responsable asignado actualmente.",
    );
  }

  // ----- Mantenimiento en curso -----
  if (data.mantenimientoAbierto) {
    const m = data.mantenimientoAbierto;
    const lines = clamp(wrap(m.descripcion, regular, 9.5, CONTENT_W - 24), 4);
    const h = 36 + lines.length * 13;
    ensure(h + 10);
    rect(MARGIN_X, y, CONTENT_W, h, STATUS_STYLE.mantenimiento.bg);
    rect(MARGIN_X, y, 4, h, STATUS_STYLE.mantenimiento.fg);
    text(
      `Mantenimiento en curso (${m.tipo}) desde el ${formatDate(m.fecha)}`,
      MARGIN_X + 14,
      y + 9,
      10,
      bold,
      STATUS_STYLE.mantenimiento.fg,
    );
    lines.forEach((line, i) =>
      text(line, MARGIN_X + 14, y + 26 + i * 13, 9.5, regular, COLOR.ink),
    );
    y += h + 10;
  }

  // ----- Historiales -----
  sectionTitle("Historial de asignaciones");
  renderTable(
    tableContext,
    [
      { title: "Persona", ratio: 0.22 },
      { title: "Cargo", ratio: 0.16 },
      { title: "Desde", ratio: 0.115 },
      { title: "Hasta", ratio: 0.115 },
      { title: "Cond. de entrega", ratio: 0.195 },
      { title: "Cond. de devolución", ratio: 0.195 },
    ],
    data.asignaciones.map((a) => [
      a.personaNombre,
      a.cargoNombre,
      formatDate(a.fechaInicio),
      a.fechaFin ? formatDate(a.fechaFin) : "Vigente",
      a.condicionEntrega,
      a.condicionDevolucion ?? "—",
    ]),
    "Sin asignaciones registradas.",
  );

  sectionTitle("Historial de traslados");
  renderTable(
    tableContext,
    [
      { title: "Fecha", ratio: 0.16 },
      { title: "Desde", ratio: 0.2 },
      { title: "Hacia", ratio: 0.2 },
      { title: "Registrado por", ratio: 0.16 },
      { title: "Motivo", ratio: 0.28 },
    ],
    data.traslados.map((t) => [
      formatDateTime(t.fechaMovimiento),
      t.areaOrigenNombre ?? "—",
      t.areaDestinoNombre,
      t.username,
      t.motivo ?? "—",
    ]),
    "Sin traslados registrados.",
  );

  sectionTitle("Historial de mantenimientos");
  renderTable(
    tableContext,
    [
      { title: "Tipo", ratio: 0.1 },
      { title: "Inicio", ratio: 0.11 },
      { title: "Fin", ratio: 0.11 },
      { title: "Descripción", ratio: 0.34 },
      { title: "Observaciones", ratio: 0.34 },
    ],
    data.mantenimientos.map((m) => [
      m.tipo === "preventivo" ? "Preventivo" : "Correctivo",
      formatDate(m.fecha),
      m.fechaFin ? formatDate(m.fechaFin) : "En curso",
      m.descripcion,
      m.observaciones ?? "—",
    ]),
    "Sin mantenimientos registrados.",
  );

  // ----- Pie de página (necesita el total de páginas) -----
  const total = pages.length;
  pages.forEach((p, index) => {
    page = p;
    hline(PAGE_H - FOOTER_H);
    const left = safe(`Generado el ${data.generadoEn} por ${data.generadoPor}`);
    const right = `Página ${index + 1} de ${total}`;
    text(left, MARGIN_X, PAGE_H - FOOTER_H + 9, 8, regular, COLOR.muted);
    text(
      right,
      PAGE_W - MARGIN_X - width(right, regular, 8),
      PAGE_H - FOOTER_H + 9,
      8,
      regular,
      COLOR.muted,
    );
  });

  return pdf.save();
}
