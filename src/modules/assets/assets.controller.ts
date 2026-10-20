// UTILS
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
