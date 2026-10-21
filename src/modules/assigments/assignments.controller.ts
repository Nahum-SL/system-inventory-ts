// Utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";
// Servicio
import { assignmentsService } from "./assignments.service.js";

/** Asigna un activo. El body llega validado. Responde 201. */
export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentsService.create(
    parseId(req.params.id, "del activo"),
    req.body,
  );

  res.status(201).json({
    status: "success",
    message: "Activo asignado correctamente",
    data: assignment,
  });
});

/** Historial de asignaciones de un activo, incluso si fue dado de baja. */
export const getAssignmentHistory = asyncHandler(async (req, res) => {
  const history = await assignmentsService.getHistory(
    parseId(req.params.id, "del activo"),
  );

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history,
  });
});

/** Registra la devolución de una asignación. El body llega validado. */
export const returnAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentsService.returnAssignment(
    parseId(req.params.id, "de la asignación"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Devolución registrada correctamente",
    data: assignment,
  });
});
