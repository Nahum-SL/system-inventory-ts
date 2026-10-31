/** Imagen ya lista para incrustar en el PDF (solo JPG o PNG). */
export interface SheetImage {
  bytes: Uint8Array;
  format: "jpg" | "png";
}

export type SheetAssetStatus =
  | "operativo"
  | "mantenimiento"
  | "fuera_de_servicio";

/**
 * Todo lo que necesita la hoja de vida. El renderizador no toca la base de
 * datos ni el disco: recibe esto ya armado (y los textos ya como cadenas).
 */
export interface AssetSheetData {
  /** Fecha y hora de emisión, ya formateada (hora de Lima). */
  generadoEn: string;
  /** Usuario que descargó el informe. */
  generadoPor: string;

  activo: {
    codigoInventario: string;
    descripcion: string;
    marcaNombre: string;
    categoriaNombre: string;
    areaNombre: string;
    fechaIngreso: string;
    estado: SheetAssetStatus;
    eliminado: boolean;
    fechaEliminacion: string | null;
    motivoEliminacion: string | null;
  };

  asignacionActual: {
    personaNombre: string;
    cargoNombre: string;
    fechaInicio: string;
  } | null;

  mantenimientoAbierto: {
    tipo: "preventivo" | "correctivo";
    fecha: string;
    descripcion: string;
  } | null;

  asignaciones: ReadonlyArray<{
    personaNombre: string;
    cargoNombre: string;
    fechaInicio: string;
    fechaFin: string | null;
    condicionEntrega: string;
    condicionDevolucion: string | null;
  }>;

  traslados: ReadonlyArray<{
    fechaMovimiento: string;
    areaOrigenNombre: string | null;
    areaDestinoNombre: string;
    username: string;
    motivo: string | null;
  }>;

  mantenimientos: ReadonlyArray<{
    tipo: "preventivo" | "correctivo";
    fecha: string;
    fechaFin: string | null;
    descripcion: string;
    observaciones: string | null;
  }>;

  /** Foto del activo, o `null` si no tiene o no se pudo leer. */
  imagen: SheetImage | null;
  /** Logo de Yonda, o `null` (se dibuja el nombre en texto). */
  logo: SheetImage | null;
}
