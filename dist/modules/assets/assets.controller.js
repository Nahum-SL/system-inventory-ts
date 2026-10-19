// Servicio GET - POST
import { assetsService } from "./assets.service.js";
/**
 * Lista todos los activos
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const listAssets = async (req, res, next) => {
    try {
        const filters = {};
        if (typeof req.query.q === "string") {
            filters.q = req.query.q;
        }
        if (req.query.estado === "activo" ||
            req.query.estado === "inactivo" ||
            req.query.estado === "mantenimiento") {
            filters.estado = req.query.estado;
        }
        if (req.query.areaId !== undefined) {
            const areaId = Number(req.query.areaId);
            if (!Number.isSafeInteger(areaId) || areaId <= 0) {
                res.status(400).json({
                    status: "error",
                    message: "El ID del área no es válido",
                });
                return;
            }
            filters.areaId = areaId;
        }
        const assets = await assetsService.list(filters);
        res.status(200).json({
            status: "success",
            results: assets.length,
            data: assets,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Realiza una busqueda por ID en Activos
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const getAssetById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                status: "error",
                message: "El ID del activo no es válido",
            });
            return;
        }
        const asset = await assetsService.getById(id);
        res.status(200).json({
            status: "success",
            data: asset,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Crea un nuevo registro en Activos
 * @param req
 * @param res
 * @param next
 */
export const createAsset = async (req, res, next) => {
    try {
        const asset = await assetsService.create(req.body);
        res.status(201).json({
            status: "success",
            message: "Activo registrado correctamente",
            data: asset,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Recibe la peticion HTTP, invoca el servicio update() y devuelve la respuesta
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const updateAsset = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                status: "error",
                message: "El ID del activo no es válido",
            });
            return;
        }
        const asset = await assetsService.update(id, req.body);
        res.status(200).json({
            status: "success",
            message: "Activo actualizado correctamente",
            data: asset,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Recibe la peticion HTTP, invoca el servicio delete() y devuelve la respuesta
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteAsset = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                status: "error",
                message: "El ID del activo no es válido",
            });
            return;
        }
        await assetsService.delete(id);
        res.status(200).json({
            status: "success",
            message: "Activo dado de baja correctamente",
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=assets.controller.js.map