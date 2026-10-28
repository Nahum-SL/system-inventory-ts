import express, { type RequestHandler } from "express";
import { BadRequestError } from "../errors/AppError.js";

const parser = express.raw({
  type: ["image/jpeg", "image/png", "image/webp"],
  limit: 5 * 1024 * 1024,
});

/** Recibe el cuerpo binario de una imagen (máx. 5 MB) en `req.body` como Buffer. */
export const imageBody: RequestHandler = (req, res, next) => {
  parser(req, res, (err?: unknown) => {
    if (err) {
      const type =
        typeof err === "object" && err !== null && "type" in err
          ? (err as { type?: string }).type
          : undefined;
      if (type === "entity.too.large") {
        return next(new BadRequestError("La imagen supera los 5 MB"));
      }
      return next(err);
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return next(new BadRequestError("Envía una imagen JPG, PNG o WebP"));
    }
    next();
  });
};
