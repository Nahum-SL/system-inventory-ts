import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

type Method = "get" | "post" | "patch" | "put" | "delete";

const send = (method: string, path: string) =>
  request(app)[method.toLowerCase() as Method](path);

/** Cada ruta que exige sesión. Al agregar una ruta a la API, agrégala aquí. */
const PROTECTED_ROUTES: Array<[Method, string]> = [
  ["get", "/api/auth/me"],
  ["post", "/api/auth/change-password"],

  ["get", "/api/users"],
  ["get", "/api/users/1"],
  ["post", "/api/users"],
  ["patch", "/api/users/1"],
  ["patch", "/api/users/1/password"],

  ["get", "/api/assets"],
  ["get", "/api/assets/1"],
  ["get", "/api/assets/code/INV-0001"],
  ["get", "/api/assets/1/qr"],
  ["post", "/api/assets"],
  ["patch", "/api/assets/1"],
  ["patch", "/api/assets/1/status"],
  ["post", "/api/assets/1/decommission"],

  ["get", "/api/assets/1/movements"],
  ["post", "/api/assets/1/movements"],
  ["get", "/api/assets/1/maintenance"],
  ["post", "/api/assets/1/maintenance"],
  ["patch", "/api/maintenance/1/close"],
  ["get", "/api/assets/1/assignments"],
  ["post", "/api/assets/1/assignments"],
  ["patch", "/api/assignments/1/return"],

  ...["people", "areas", "brands", "categories", "positions"].flatMap(
    (resource): Array<[Method, string]> => [
      ["get", `/api/${resource}`],
      ["get", `/api/${resource}/1`],
      ["post", `/api/${resource}`],
      ["patch", `/api/${resource}/1`],
    ],
  ),

  ["get", "/api/reports/summary"],
  ["get", "/api/reports/export/assets"],
  ["get", "/api/reports/export/movements"],
  ["get", "/api/reports/export/maintenance"],
];

describe("Enrutamiento y autenticación", () => {
  describe("sin sesión", () => {
    it.each(PROTECTED_ROUTES)(
      "%s %s exige sesión (401 sin token)",
      async (method, path) => {
        expect((await request(app)[method](path)).status).toBe(401);
      },
    );

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
