import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";

const dir = path.resolve(env.IMAGES_DIR);
// Solo nombres generados por nosotros: evita path traversal.
const FILE_RE = /^[0-9a-f-]{36}\.webp$/;

export const imageStorage = {
  /** Guarda el buffer con un nombre nuevo y devuelve ese nombre. */
  async save(buffer: Buffer): Promise<string> {
    await fs.mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.webp`;
    await fs.writeFile(path.join(dir, name), buffer, { flag: "wx" });
    return name;
  },

  /** Borra un archivo; si no existe o el nombre no es válido, no hace nada. */
  async remove(name: string | null): Promise<void> {
    if (!name || !FILE_RE.test(name)) return;
    await fs.rm(path.join(dir, name), { force: true });
  },

  /** Ruta absoluta de un archivo guardado. */
  pathOf(name: string): string {
    if (!FILE_RE.test(name)) throw new Error("Nombre de imagen inválido");
    return path.join(dir, name);
  },
};
