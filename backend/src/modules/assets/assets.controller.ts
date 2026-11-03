// UTILS
import { NotFoundError } from "../../shared/errors/AppError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";
// SERVICIO
import { assetsService } from "./assets.service.js";
// Types
import type { AssetFilters } from "./assets.types.js";

/** Lista activos. El query llega validado por `validate(listAssetsQuerySchema, "query")`. */
export const listAssets = asyncHandler(async (req, res) => {
  const assets = await assetsService.list(req.query as AssetFilters);

  res.status(200).json({
    status: "success",
    results: assets.length,
    data: assets,
  });
});

export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await assetsService.getById(
    parseId(req.params.id, "del activo"),
  );

  res.status(200).json({ status: "success", data: asset });
});

export const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetsService.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Activo registrado correctamente",
    data: asset,
  });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetsService.update(
    parseId(req.params.id, "del activo"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Activo actualizado correctamente",
    data: asset,
  });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  await assetsService.delete(parseId(req.params.id, "del activo"));

  res.status(200).json({
    status: "success",
    message: "Activo dado de baja correctamente",
  });
});

/** Cambia el estado manual del activo. El body llega validado. */
export const updateAssetStatus = asyncHandler(async (req, res) => {
  const asset = await assetsService.changeStatus(
    parseId(req.params.id, "del activo"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Estado del activo actualizado correctamente",
    data: asset,
  });
});

/** Da de baja un activo. El body (`motivo`) llega validado. */
export const decommissionAsset = asyncHandler(async (req, res) => {
  await assetsService.decommission(
    parseId(req.params.id, "del activo"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Activo dado de baja correctamente",
  });
});

/** Ficha del activo por código (la que abre el QR). 404 si no existe, 410 si está dado de baja. */
export const getAssetByCode = asyncHandler(async (req, res) => {
  const card = await assetsService.getCardByCode(req.params.codigo as string);

  res.status(200).json({ status: "success", data: card });
});

/** QR del activo en SVG. */
export const getAssetQr = asyncHandler(async (req, res) => {
  const svg = await assetsService.getQrSvg(
    parseId(req.params.id, "del activo"),
  );

  res.status(200).type("image/svg+xml").send(svg);
});

/**
 * Devuelve la imagen del activo, si existe. No da de baja ni borra el activo. El activo debe existir.
 */
export const getAssetImage = asyncHandler(async (req, res, next) => {
  const file = await assetsService.getImagePath(
    parseId(req.params.id, "del activo"),
  );

  res.sendFile(
    file,
    {
      dotfiles: "deny",
      headers: {
        "Content-Type": "image/webp",
        // El nombre cambia con cada imagen nueva, por eso es seguro cachear.
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    },
    (err) => {
      if (err && !res.headersSent)
        next(new NotFoundError("La imagen no está disponible"));
    },
  );
});

/**
 * Sube o reemplaza la imagen del activo. No borra el activo ni lo da de baja. El activo debe existir.
 */
export const uploadAssetImage = asyncHandler(async (req, res) => {
  const asset = await assetsService.setImage(
    parseId(req.params.id, "del activo"),
    req.body as Buffer,
  );
  res.status(200).json({
    status: "success",
    message: "Imagen actualizada correctamente",
    data: asset,
  });
});

/**
 * Borra la imagen del activo. No borra el activo ni lo da de baja. El activo debe existir y tener imagen.
 */
export const deleteAssetImage = asyncHandler(async (req, res) => {
  const asset = await assetsService.removeImage(
    parseId(req.params.id, "del activo"),
  );
  res.status(200).json({
    status: "success",
    message: "Imagen eliminada correctamente",
    data: asset,
  });
});

/**
 * Invoca el endpoint que sugiere el próximo código de activo. Solo admin puede ver esto.
 */
export const getNextAssetCode = asyncHandler(async (_req, res) => {
  const codigo = await assetsService.getNextCode();

  res.status(200).json({ status: "success", data: { codigo } });
});
