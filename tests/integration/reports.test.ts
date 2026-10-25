import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
// HELPERS - TEST
import { app, prepareTest } from "../setup/helpers.js";

describe("GET /api/reports/summary", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const summary = (token = t?.adminToken) =>
    request(app).get("/api/reports/summary").auth(token, { type: "bearer" });

  it("totales: no cuenta los dados de baja y deriva asignados y disponibles", async () => {
    const res = await summary();

    expect(res.status).toBe(200);
    expect(res.body.data.totals).toEqual({
      total: 3,
      operativos: 2,
      enMantenimiento: 1,
      fueraDeServicio: 0,
      asignados: 1,
      disponibles: 1,
      dadosDeBaja: 1,
    });
  });

  it("por área incluye áreas vacías y por categoría suma los activos visibles", async () => {
    const { byArea, byCategory } = (await summary()).body.data;

    expect(byArea).toEqual([
      expect.objectContaining({ nombre: "Sistemas", total: 3 }),
      expect.objectContaining({ nombre: "Ventas", total: 0 }),
    ]);
    expect(byCategory).toEqual([
      expect.objectContaining({ nombre: "Computación", total: 3 }),
    ]);
  });

  it("un traslado actualiza el conteo por área y aparece en lo reciente", async () => {
    await request(app)
      .post(`/api/assets/${t.data.assets.free}/movements`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ areaDestinoId: t.data.areas.ventasId });

    const { byArea, recentMovements } = (await summary()).body.data;

    expect(
      byArea.map((a: { nombre: string; total: number }) => [a.nombre, a.total]),
    ).toEqual([
      ["Sistemas", 2],
      ["Ventas", 1],
    ]);
    expect(recentMovements).toHaveLength(1);
    expect(recentMovements[0]).toMatchObject({
      codigoInventario: "INV-0001",
      areaOrigenNombre: "Sistemas",
      areaDestinoNombre: "Ventas",
    });
  });

  it("rol usuario: 403; sin token: 401", async () => {
    expect((await summary(t.userToken)).status).toBe(403);
    expect((await request(app).get("/api/reports/summary")).status).toBe(401);
  });
});
