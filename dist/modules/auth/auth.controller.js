import { authService } from "./auth.service.js";
/**
 * Se encarga de recibir la peticion HTTP, invocar el servicio y devolver la respuesta
 * No contiene SQL ni logica de contraseñas
 */
export const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            status: "success",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=auth.controller.js.map