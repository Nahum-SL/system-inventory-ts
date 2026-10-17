import type { AuthenticatedIdentity } from "../../modules/auth/auth.types.js";

/**
 * Permite que TS reconozca req.auth sin recurrir a any
*/
declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedIdentity;
    }
  }
}

export {};
