import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

describe("GET /api/assets/code/:codigo (ficha del QR)", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const get = (codigo: string, token = t?.adminToken) =>
    request(app)
      .get(`/api/assets/code/${codigo}`)
      .auth(token, { type: "bearer" });

  it("activo libre: disponible, sin asignación ni mantenimiento", async () => {
    const res = await get("INV-0001");

    expect(res.status).toBe(200);
    expect(res.body.data.disponibilidad).toBe("disponible");
    expect(res.body.data.asignacionActual).toBeNull();
    expect(res.body.data.mantenimientoAbierto).toBeNull();
  });

  it("activo asignado: incluye la asignación actual", async () => {
    const res = await get("INV-0002");

    expect(res.status).toBe(200);
    expect(res.body.data.disponibilidad).toBe("asignado");
    expect(res.body.data.asignacionActual.personaNombre).toContain(
      "Trabajador",
    );
  });

  it("activo en mantenimiento: incluye el mantenimiento abierto", async () => {
    const res = await get("INV-0003");

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe("mantenimiento");
    expect(res.body.data.mantenimientoAbierto.descripcion).toBe("No enciende");
  });

  it("activo dado de baja: 410 con el motivo", async () => {
    const res = await get("INV-0004");

    expect(res.status).toBe(410);
    expect(res.body.message).toContain("dado de baja");
    expect(res.body.message).toContain("Equipo obsoleto");
  });

  it("código inexistente: 404", async () => {
    expect((await get("INV-9999")).status).toBe(404);
  });

  it("código con caracteres inválidos: 400", async () => {
    expect((await get("INV%200001")).status).toBe(400);
  });

  it("sin token: 401", async () => {
    const res = await request(app).get("/api/assets/code/INV-0001");

    expect(res.status).toBe(401);
  });

  it("el activo dado de baja no aparece en el listado", async () => {
    const res = await request(app)
      .get("/api/assets")
      .auth(t.adminToken, { type: "bearer" });
    const codes = res.body.data.map(
      (a: { codigoInventario: string }) => a.codigoInventario,
    );

    expect(codes).not.toContain("INV-0004");
  });
});
