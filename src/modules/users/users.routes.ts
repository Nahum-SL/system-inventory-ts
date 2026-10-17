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

const router = Router();

// Autentica y authoriza si el usuario es admin
router.use(authenticate, authorize("admin"));

// Rutas endpoint
router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema), createUser);

export default router;
