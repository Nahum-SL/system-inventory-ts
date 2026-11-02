  import { rgb } from "pdf-lib";
  import type { SheetAssetStatus } from "./asset-sheet.types.js";

  // ============================================================
  // Medidas (puntos PDF; A4) y colores. `y` se mide desde ARRIBA.
  // ============================================================
  export const PAGE_W = 595.28;
  export const PAGE_H = 841.89;
  export const MARGIN_X = 40;
  export const CONTENT_W = PAGE_W - MARGIN_X * 2;
  export const HEADER_H = 44;
  export const FOOTER_H = 34;
  export const CONTENT_TOP = HEADER_H + 24;
  export const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 12;

  export const COLOR = {
    orange: rgb(1, 95 / 255, 1 / 255), // #FF5F01, el naranja exacto del logo
    orangeDark: rgb(0.604, 0.204, 0.071),
    orangeTint: rgb(1, 0.969, 0.929),
    ink: rgb(0.122, 0.161, 0.216),
    muted: rgb(0.42, 0.447, 0.502),
    line: rgb(0.898, 0.906, 0.922),
    zebra: rgb(0.976, 0.98, 0.984),
    white: rgb(1, 1, 1),
    emptyBox: rgb(0.953, 0.957, 0.965),
  };

  export const STATUS_STYLE: Record<
    SheetAssetStatus | "baja" | "asignado" | "disponible",
    { label: string; fg: ReturnType<typeof rgb>; bg: ReturnType<typeof rgb> }
  > = {
    operativo: {
      label: "Operativo",
      fg: rgb(0.082, 0.502, 0.239),
      bg: rgb(0.863, 0.988, 0.906),
    },
    mantenimiento: {
      label: "En mantenimiento",
      fg: rgb(0.706, 0.325, 0.035),
      bg: rgb(0.996, 0.953, 0.78),
    },
    fuera_de_servicio: {
      label: "Fuera de servicio",
      fg: rgb(0.725, 0.11, 0.11),
      bg: rgb(0.996, 0.886, 0.886),
    },
    baja: {
      label: "Dado de baja",
      fg: rgb(0.216, 0.255, 0.318),
      bg: rgb(0.898, 0.906, 0.922),
    },
    asignado: {
      label: "Asignado",
      fg: rgb(0.114, 0.306, 0.847),
      bg: rgb(0.859, 0.918, 0.996),
    },
    disponible: {
      label: "Disponible",
      fg: rgb(0.082, 0.502, 0.239),
      bg: rgb(0.863, 0.988, 0.906),
    },
  };
