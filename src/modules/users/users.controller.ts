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
