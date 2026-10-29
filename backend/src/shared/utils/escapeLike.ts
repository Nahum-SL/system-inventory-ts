/** Escapa los comodines de LIKE; el carácter de escape por defecto en MySQL es la barra invertida. */
export const escapeLike = (value: string): string => value.replace(/[\\%_]/g, "\\$&");