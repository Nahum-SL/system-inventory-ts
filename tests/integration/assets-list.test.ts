import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

describe("GET /api/assets (filtros)", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const codes = async (query: string) => {
    const res = await request(app)
      .get(`/api/assets${query}`)
      .auth(t.adminToken, { type: "bearer" });

    expect(res.status).toBe(200);
    return res.body.data
      .map((a: { codigoInventario: string }) => a.codigoInventario)
      .sort();
  };

  it("asignacion=asignado devuelve solo los que tienen responsable", async () => {
    expect(await codes("?asignacion=asignado")).toEqual(["INV-0002"]);
  });

  it("asignacion=libre devuelve los que no tienen responsable", async () => {
    expect(await codes("?asignacion=libre")).toEqual(["INV-0001", "INV-0003"]);
  });

  it("estado + asignacion se combinan (equivale al KPI de disponibles)", async () => {
    expect(await codes("?estado=operativo&asignacion=libre")).toEqual([
      "INV-0001",
    ]);
  });

  it("búsqueda por texto", async () => {
    expect(await codes("?q=INV-0002")).toEqual(["INV-0002"]);
  });

  it("los comodines escritos por el usuario no actúan como comodines", async () => {
    expect(await codes("?q=%25")).toEqual([]);
    expect(await codes("?q=INV_0002")).toEqual([]);
  });
  
  it("las rutas de ciclo de vida exigen sesión y una ruta inexistente da 404", async () => {
    for (const path of [
      "/api/assets/1/maintenance",
      "/api/assets/1/assignments",
      "/api/assets/1/movements",
    ]) {
      expect((await request(app).get(path)).status).toBe(401);
    }

    expect((await request(app).get("/api/no-existe")).status).toBe(404);
  });
});
