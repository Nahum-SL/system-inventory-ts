import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

describe("Reportes CSV", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const get = (path: string, token = t?.adminToken) =>
    request(app)
      .get(`/api/reports/export/${path}`)
      .auth(token, { type: "bearer" });

  const rows = (text: string) =>
    text
      .replace(/^\uFEFF/, "")
      .trimEnd()
      .split("\r\n");

  it("activos: cabecera, solo los no dados de baja, y responsable del asignado", async () => {
    const res = await get("assets");
    const lines = rows(res.text);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toMatch(
      /attachment; filename="activos_\d{4}-\d{2}-\d{2}\.csv"/,
    );
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(lines[0]).toContain("Responsable");
    expect(lines).toHaveLength(4); // cabecera + 3 activos (el dado de baja no sale)
    expect(lines.find((l) => l.startsWith("INV-0002"))).toContain(
      "Prueba, Trabajador",
    );
    expect(lines.some((l) => l.startsWith("INV-0004"))).toBe(false);
  });

  it("activos: respeta los mismos filtros que la lista", async () => {
    const lines = rows((await get("assets?estado=mantenimiento")).text);

    expect(lines).toHaveLength(2);
    expect(lines[1]).toMatch(/^INV-0003,/);
  });

  it("movimientos: incluye el traslado, y el rango de fechas lo filtra", async () => {
    await request(app)
      .post(`/api/assets/${t.data.assets.free}/movements`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ areaDestinoId: t.data.areas.ventasId, motivo: "Prueba" });

    const all = rows((await get("movements")).text);
    expect(all).toHaveLength(2);
    expect(all[1]).toContain("Sistemas,Ventas");

    expect(rows((await get("movements?hasta=2000-01-01")).text)).toHaveLength(
      1,
    );
  });

  it("mantenimientos: el abierto sale con fecha de fin vacía", async () => {
    const lines = rows((await get("maintenance")).text);

    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("No enciende");
    expect(lines[1]).toContain("2026-10-15,,"); // inicio, fin vacío
  });

  it("rango inválido: 400; rol usuario: 403; sin token: 401", async () => {
    expect(
      (await get("movements?desde=2026-10-10&hasta=2026-10-01")).status,
    ).toBe(400);
    expect((await get("assets", t.userToken)).status).toBe(403);
    expect((await request(app).get("/api/reports/export/assets")).status).toBe(
      401,
    );
  });
});
