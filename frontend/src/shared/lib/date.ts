/** Fecha de hoy según el reloj del dispositivo, en formato YYYY-MM-DD. */
export const todayLocal = (): string => new Date().toLocaleDateString("en-CA");
