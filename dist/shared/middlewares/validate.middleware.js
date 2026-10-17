// Importa la clase BadRequestError desde el archivo de errores personalizado
import { BadRequestError } from "../errors/AppError.js";
/**
 * Middleware de validación que utiliza un esquema de Zod para validar
 * partes específicas de la solicitud (body, params o query).
*/
export function validate(schema, part = "body") {
    return (req, _res, next) => {
        // Valida la parte especificada de la solicitud utilizando el esquema de Zod
        const result = schema.safeParse(req[part]);
        // Si la validación falla, crea un BadRequestError con los detalles de los errores y pasa el error al siguiente middleware
        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            // Pasa un BadRequestError con los detalles de la validación fallida al siguiente middleware
            next(new BadRequestError(JSON.stringify({
                message: "Validacion fallida",
                details,
            })));
            return;
        }
        // Si la validación es exitosa, reemplaza la parte de la solicitud con los datos validados 
        // y pasa al siguiente middleware
        next();
    };
}
// schema.safeParse() -> valida los datos sin lanzar una excepción.
// next() -> permite continuar al siguiente middleware o controlador.
//# sourceMappingURL=validate.middleware.js.map