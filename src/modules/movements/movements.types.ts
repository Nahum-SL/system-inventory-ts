
/**
 * Interfaz necesaria para la creacion de un nuevo registro en Movimiento
 */
export interface CreateMovementData {
  activoId: number;
  areaDestinoId: number;
  usuarioId: number;
  motivo?: string;
}

/**
 * Campos de la tabla Movimiento
 */
export interface Movement {
  id: number;
  activoId: number;
  codigoInventario: string;
  areaOrigenId: number | null;
  areaOrigenNombre: string | null;
  areaDestinoId: number;
  areaDestinoNombre: string;
  usuarioId: number;
  username: string;
  fechaMovimiento: string;
  motivo: string | null;
}
