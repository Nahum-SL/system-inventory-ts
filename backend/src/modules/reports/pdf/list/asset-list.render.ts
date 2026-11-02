import { PDFDocument, StandardFonts, type PDFImage } from "pdf-lib";

import type { AssetListData, AssetListItem } from "./asset-list.types.js";
import {
  COLOR,
  CONTENT_BOTTOM,
  CONTENT_TOP,
  CONTENT_W,
  MARGIN_X,
  STATUS_STYLE,
} from "../sheet/asset-sheet.const.js";
import type { SheetImage } from "../sheet/asset-sheet.types.js";
import { createKit } from "./pdf-kit.js";

// Columnas: foto | código | descripción | marca y categoría | responsable | estado
const COL_FOTO = 52;
const COL_CODIGO = 66;
const COL_MARCA = 90;
const COL_RESP = 90;
const COL_ESTADO = 84;
const COL_DESC =
  CONTENT_W - COL_FOTO - COL_CODIGO - COL_MARCA - COL_RESP - COL_ESTADO;

const THUMB = 44;
const PAD = 5;
const LINE = 11;
const COLS_H = 18;
const GROUP_H = 20;

/** Listado de activos agrupado por área, con miniatura, descripción y estado. */
export async function renderAssetList(
  data: AssetListData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Listado de activos");
  pdf.setAuthor("SYSTEM-INVENTORY");
  pdf.setCreator("SYSTEM-INVENTORY");
  pdf.setProducer("SYSTEM-INVENTORY");

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const k = createKit(pdf, { regular, bold, italic });

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
  const logo = await embed(data.logo);

  let y = CONTENT_TOP;
  const CONTENT_END = CONTENT_BOTTOM;

  const drawColumnsHeader = () => {
    k.rect(MARGIN_X, y, CONTENT_W, COLS_H, COLOR.zebra);
    let x = MARGIN_X;
    const cols: Array<[string, number]> = [
      ["Foto", COL_FOTO],
      ["Código", COL_CODIGO],
      ["Descripción", COL_DESC],
      ["Marca / Categoría", COL_MARCA],
      ["Responsable", COL_RESP],
      ["Estado", COL_ESTADO],
    ];
    for (const [title, w] of cols) {
      k.text(title, x + PAD, y + 5, 8, bold, COLOR.muted);
      x += w;
    }
    y += COLS_H;
  };

  const newPage = (withColumns: boolean) => {
    k.addPage(logo, "LISTADO DE ACTIVOS", `${data.activos.length} activos`);
    y = CONTENT_TOP;
    if (withColumns) drawColumnsHeader();
  };

  /** Abre página nueva (con encabezado de columnas) si no caben `h` puntos. */
  const ensure = (h: number): boolean => {
    if (y + h <= CONTENT_END) return false;
    newPage(true);
    return true;
  };

  // ---------- Primera página: título, resumen y filtros ----------
  newPage(false);

  k.text("Listado de activos", MARGIN_X, y, 20, bold, COLOR.ink);
  y += 30;

  const count = (fn: (a: AssetListItem) => boolean) =>
    data.activos.filter(fn).length;
  const stats: Array<[string, number]> = [
    ["Total", data.activos.length],
    ["Asignados", count((a) => !a.eliminado && a.responsable !== null)],
    ["Operativos", count((a) => !a.eliminado && a.estado === "operativo")],
    [
      "En mantenimiento",
      count((a) => !a.eliminado && a.estado === "mantenimiento"),
    ],
    [
      "Fuera de servicio",
      count((a) => !a.eliminado && a.estado === "fuera_de_servicio"),
    ],
    ["Dados de baja", count((a) => a.eliminado)],
  ];
  const cellW = CONTENT_W / stats.length;
  stats.forEach(([label, n], i) => {
    const x = MARGIN_X + i * cellW;
    k.text(String(n), x, y, 16, bold, COLOR.ink);
    k.text(label, x, y + 20, 8.5, regular, COLOR.muted);
  });
  y += 40;

  const filtroTexto =
    data.filtros.length > 0
      ? `Filtros aplicados: ${data.filtros.join("  ·  ")}`
      : "Sin filtros";
  for (const line of k.clamp(k.wrap(filtroTexto, italic, 9, CONTENT_W), 3)) {
    k.text(line, MARGIN_X, y, 9, italic, COLOR.muted);
    y += 13;
  }
  y += 10;

  if (data.activos.length === 0) {
    k.text(
      "No hay activos para los filtros seleccionados.",
      MARGIN_X,
      y,
      10,
      italic,
      COLOR.muted,
    );
    k.drawFooters(data.generadoEn, data.generadoPor);
    return pdf.save();
  }

  drawColumnsHeader();

  // ---------- Filas agrupadas por área ----------
  // Las miniaturas se incrustan de a una, al dibujar su fila (un JPG repetido no se reutiliza).
  const groupCount = new Map<string, number>();
  for (const a of data.activos)
    groupCount.set(a.areaNombre, (groupCount.get(a.areaNombre) ?? 0) + 1);

  const layout = (a: AssetListItem) => {
    const desc = k.clamp(
      k.wrap(a.descripcion || "—", regular, 8.5, COL_DESC - PAD * 2),
      4,
    );
    const code = k.clamp(
      k.wrap(a.codigoInventario, bold, 9, COL_CODIGO - PAD * 2),
      2,
    );
    const marca = k.clamp(
      k.wrap(a.marcaNombre, bold, 8.5, COL_MARCA - PAD * 2),
      2,
    );
    const cat = k.clamp(
      k.wrap(a.categoriaNombre, regular, 8, COL_MARCA - PAD * 2),
      2,
    );
    const respName = a.responsable
      ? k.clamp(k.wrap(a.responsable.nombre, bold, 8, COL_RESP - PAD * 2), 3)
      : [];

    const respCargo = a.responsable
      ? k.clamp(
          k.wrap(a.responsable.cargo, regular, 7.5, COL_RESP - PAD * 2),
          2,
        )
      : [];

    const respLines = a.responsable ? respName.length + respCargo.length : 1;

    const textH =
      Math.max(desc.length, code.length, marca.length + cat.length, respLines) *
      LINE;

    return {
      desc,
      code,
      marca,
      cat,
      respName,
      respCargo,
      height: Math.max(THUMB, textH) + PAD * 2,
    };
  };

  let currentArea: string | null = null;
  let rowIndex = 0;

  for (const a of data.activos) {
    const row = layout(a);

    if (a.areaNombre !== currentArea) {
      currentArea = a.areaNombre;
      rowIndex = 0;
      // El título del área nunca queda solo al final de una página.
      ensure(GROUP_H + row.height + 4);
      k.rect(MARGIN_X, y, CONTENT_W, GROUP_H, COLOR.orangeTint);
      const n = groupCount.get(currentArea) ?? 0;
      k.text(
        k.safe(`${currentArea}  ·  ${n} ${n === 1 ? "activo" : "activos"}`),
        MARGIN_X + PAD,
        y + 5.5,
        9,
        bold,
        COLOR.orangeDark,
      );
      y += GROUP_H;
    } else if (ensure(row.height)) {
      // Página nueva en medio de un área: se recuerda a qué área pertenece.
      k.rect(MARGIN_X, y, CONTENT_W, GROUP_H, COLOR.orangeTint);
      k.text(
        k.safe(`${currentArea}  (continuación)`),
        MARGIN_X + PAD,
        y + 5.5,
        9,
        bold,
        COLOR.orangeDark,
      );
      y += GROUP_H;
    }

    if (rowIndex % 2 === 1)
      k.rect(MARGIN_X, y, CONTENT_W, row.height, COLOR.zebra);

    // Foto
    const tx = MARGIN_X + (COL_FOTO - THUMB) / 2;
    const ty = y + (row.height - THUMB) / 2;
    const thumb = await embed(a.foto);
    if (thumb) {
      k.strokeRect(tx, ty, THUMB, THUMB, COLOR.line);
      k.drawContained(thumb, tx + 1, ty + 1, THUMB - 2, THUMB - 2);
    } else {
      k.rect(tx, ty, THUMB, THUMB, COLOR.emptyBox);
      k.strokeRect(tx, ty, THUMB, THUMB, COLOR.line);
      const label = "Sin foto";
      k.text(
        label,
        tx + (THUMB - k.width(label, italic, 7)) / 2,
        ty + THUMB / 2 - 3,
        7,
        italic,
        COLOR.muted,
      );
    }

    // Textos
    let x = MARGIN_X + COL_FOTO;
    row.code.forEach((l, i) =>
      k.text(l, x + PAD, y + PAD + i * LINE, 9, bold, COLOR.ink),
    );
    x += COL_CODIGO;
    row.desc.forEach((l, i) =>
      k.text(l, x + PAD, y + PAD + i * LINE, 8.5, regular, COLOR.ink),
    );
    x += COL_DESC;
    row.marca.forEach((l, i) =>
      k.text(l, x + PAD, y + PAD + i * LINE, 8.5, bold, COLOR.ink),
    );
    row.cat.forEach((l, i) =>
      k.text(
        l,
        x + PAD,
        y + PAD + (row.marca.length + i) * LINE,
        8,
        regular,
        COLOR.muted,
      ),
    );
    x += COL_MARCA;

    // Responsable actual
    if (row.respName.length > 0) {
      row.respName.forEach((l, i) =>
        k.text(l, x + PAD, y + PAD + i * LINE, 8, bold, COLOR.ink),
      );
      row.respCargo.forEach((l, i) =>
        k.text(
          l,
          x + PAD,
          y + PAD + (row.respName.length + i) * LINE,
          7.5,
          regular,
          COLOR.muted,
        ),
      );
    } else {
      k.text(
        a.eliminado ? "—" : "Sin asignar",
        x + PAD,
        y + PAD,
        8,
        italic,
        COLOR.muted,
      );
    }
    x += COL_RESP;
    
    // Estado (el aviso de baja prevalece sobre el estado operativo guardado)
    const style = a.eliminado ? STATUS_STYLE.baja : STATUS_STYLE[a.estado];
    const chipW = k.width(style.label, bold, 7.5) + 12;
    k.rect(x + PAD, y + PAD, chipW, 15, style.bg);
    k.text(style.label, x + PAD + 6, y + PAD + 3.5, 7.5, bold, style.fg);

    y += row.height;
    k.hline(y);
    rowIndex++;
  }

  k.drawFooters(data.generadoEn, data.generadoPor);
  return pdf.save();
}
