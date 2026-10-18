import { Router } from "express";
// =============
// MIDDLEWARES
// =============
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// MODULO USER
// Schema Validacion de campos
import { createUserSchema } from "./users.schema.js";
// controladores
import { createUser, getUserById, listUsers } from "./users.controller.js";
const userRoutes = Router();
// Autentica y authoriza si el usuario es admin
userRoutes.use(authenticate, authorize("admin"));
// Rutas endpoint
userRoutes.get("/", listUsers);
userRoutes.get("/:id", getUserById);
userRoutes.post("/", validate(createUserSchema), createUser);
export default userRoutes;
//# sourceMappingURL=users.routes.js.map