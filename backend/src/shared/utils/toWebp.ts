import sharp from "sharp";
import { BadRequestError } from "../errors/AppError.js";

const ALLOWED = new Set(["jpeg", "png", "webp"]);
const LIMIT = { limitInputPixels: 50_000_000 };

/**
 * Valida que el buffer sea realmente una imagen (JPG, PNG o WebP) y la
 * normaliza: corrige la rotación, limita a 1200 px y reencoda a WebP.
 * Al reencodar se eliminan los metadatos EXIF (incluido el GPS).
 */
export async function toWebp(input: Buffer): Promise<Buffer> {
  try {
    const meta = await sharp(input, LIMIT).metadata();
    if (!meta.format || !ALLOWED.has(meta.format)) throw new Error("formato");

    return await sharp(input, LIMIT)
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new BadRequestError(
      "El archivo no es una imagen válida (JPG, PNG o WebP)",
    );
  }
}
