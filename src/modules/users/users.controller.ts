import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";
import { usersService } from "./users.service.js";

/** Lista las cuentas de usuario (solo admin). */
export const listUsers = asyncHandler(async (_req, res) => {
  const users = await usersService.list();

  res
    .status(200)
    .json({ status: "success", results: users.length, data: users });
});

/** Obtiene una cuenta por id. Responde 400 si el id no es válido o 404 si no existe. */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getById(
    parseId(req.params.id, "del usuario"),
  );

  res.status(200).json({ status: "success", data: user });
});

/** Crea una cuenta. El body llega validado. Responde 201, 404 o 409. */
export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Usuario creado correctamente",
    data: user,
  });
});


/** Cambia rol y/o estado. El body llega validado. */
export const updateUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError("Debes autenticarte primero");

  const user = await usersService.update(parseId(req.params.id, "del usuario"), req.auth.id, req.body);

  res.status(200).json({ status: "success", message: "Usuario actualizado correctamente", data: user });
});

/** Restablece la contraseña de una cuenta (solo admin). */
export const resetUserPassword = asyncHandler(async (req, res) => {
  await usersService.resetPassword(parseId(req.params.id, "del usuario"), req.body);

  res.status(200).json({ status: "success", message: "Contraseña restablecida correctamente" });
});