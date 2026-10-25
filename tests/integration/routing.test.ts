import listEndpoints from "express-list-endpoints";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

type Method = "get" | "post" | "patch" | "put" | "delete";

const send = (method: string, path: string) =>
  request(app)[method.toLowerCase() as Method](path);

/** Rutas que no exigen sesión (el resto debe responder 401 sin token). */
const PUBLIC_ROUTES = new Set(["GET /api/health", "POST /api/auth/login"]);

/** Reemplaza los parámetros de ruta (`:id`, `:codigo`) por un valor cualquiera. */
const fillParams = (path: string): string => path.replace(/:[^/]+/g, "1");

describe("Enrutamiento y autenticación", () => {
  describe("sin sesión", () => {
    it("ninguna ruta de la API queda sin autenticar", async () => {
      const endpoints = listEndpoints(app);

      // Si la librería no ve las rutas, esta prueba pasaría sin comprobar nada.
      expect(endpoints.length).toBeGreaterThan(30);

      const offenders: string[] = [];

      for (const { path, methods } of endpoints) {
        for (const method of methods) {
          if (PUBLIC_ROUTES.has(`${method} ${path}`)) continue;

          const res = await send(method, fillParams(path));

          if (res.status !== 401)
            offenders.push(`${method} ${path} → ${res.status}`);
        }
      }

      expect(offenders).toEqual([]);
    });

    it("las rutas públicas siguen siendo públicas", async () => {
      expect((await request(app).get("/api/health")).status).toBe(200);
      // Sin credenciales, el login responde 400 (validación), no 401.
      expect((await request(app).post("/api/auth/login").send({})).status).toBe(
        400,
      );
    });

    it("una ruta inexistente responde 404 en JSON, no 401", async () => {
      for (const path of ["/api/no-existe", "/api/otra/ruta/mas/larga"]) {
        const res = await request(app).get(path);

        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.body.status).toBe("error");
      }
    });
  });

  describe("con sesión de administrador", () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = (await prepareTest()).adminToken;
    });

    const asAdmin = (method: string, path: string) =>
      send(method, path).auth(adminToken, { type: "bearer" });

    it("rutas inexistentes dentro de un módulo existente: 404", async () => {
      expect((await asAdmin("get", "/api/no-existe")).status).toBe(404);
      expect((await asAdmin("get", "/api/assets/1/no-existe")).status).toBe(
        404,
      );
      expect(
        (await asAdmin("post", "/api/assets/1/maintenance/otra")).status,
      ).toBe(404);
    });

    it("el borrado directo de activos ya no existe (la baja es POST /decommission)", async () => {
      expect((await asAdmin("delete", "/api/assets/1")).status).toBe(404);
    });

    it("ids inválidos en la ruta: 400", async () => {
      for (const id of ["abc", "0", "-5", "1.5"]) {
        expect((await asAdmin("get", `/api/assets/${id}`)).status).toBe(400);
      }
    });

    it("un JSON mal formado responde 400 con el formato de error de la API", async () => {
      const res = await request(app)
        .post("/api/assets")
        .auth(adminToken, { type: "bearer" })
        .set("Content-Type", "application/json")
        .send("{ esto no es json");

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toContain("JSON");
    });

    it("los errores no filtran detalles internos", async () => {
      const res = await asAdmin("get", "/api/assets/999999");

      expect(res.status).toBe(404);
      expect(Object.keys(res.body).sort()).toEqual(["message", "status"]);
      expect(JSON.stringify(res.body)).not.toMatch(
        /stack|at .*\.ts|node_modules/,
      );
    });

    it("las respuestas llevan cabeceras de seguridad y no exponen Express", async () => {
      const res = await request(app).get("/api/health");

      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-powered-by"]).toBeUndefined();
    });
  });
});
