import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";
import { movementsService } from "./movements.service.js";

/** Traslada un activo. El usuario sale del token y el body llega validado. */
export const createMovement = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError("Debes autenticarte primero");

  const movement = await movementsService.create(
    parseId(req.params.id, "del activo"),
    req.auth.id,
    req.body,
  );

  res.status(201).json({
    status: "success",
    message: "Movimiento registrado correctamente",
    data: movement,
  });
});

/** Historial de traslados de un activo, incluso si fue dado de baja. */
export const getMovementHistory = asyncHandler(async (req, res) => {
  const history = await movementsService.getHistory(
    parseId(req.params.id, "del activo"),
  );

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history,
  });
});
