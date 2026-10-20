import { ValidationError } from "../errors/AppError.js";
/**
 * Valida una parte de la solicitud (body, params o query) con un esquema de Zod.
 *
 * - Si falla, pasa un {@link ValidationError} con el detalle por campo.
 * - Si pasa, reemplaza esa parte de la solicitud por los datos ya
 *   parseados (recortados, normalizados y sin claves desconocidas).
 *
 * @param schema - Esquema de Zod contra el que se valida.
 * @param part - Parte de la solicitud a validar. Por defecto `body`.
 */
export function validate(schema, part = "body") {
    return (req, _res, next) => {
        const result = schema.safeParse(req[part]);
        if (!result.success) {
            next(new ValidationError(result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))));
            return;
        }
        // defineProperty en vez de `req[part] = ...`: en Express 5, `req.query`
        // es un getter de solo lectura y la asignación directa lanzaría un error.
        Object.defineProperty(req, part, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map