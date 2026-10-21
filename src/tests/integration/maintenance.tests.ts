import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

const NEW_MAINTENANCE = {
  tipo: "correctivo",
  fecha: "2026-10-20",
  descripcion: "Falla de pantalla",
  costo: 0,
};

describe("Mantenimiento", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const open = (assetId: number, token = t.adminToken) =>
    request(app)
      .post(`/api/assets/${assetId}/maintenance`)
      .auth(token, { type: "bearer" })
      .send(NEW_MAINTENANCE);

  const close = (id: number, body: object, token = t.adminToken) =>
    request(app)
      .patch(`/api/maintenance/${id}/close`)
      .auth(token, { type: "bearer" })
      .send(body);

  const getAsset = (id: number) =>
    request(app)
      .get(`/api/assets/${id}`)
      .auth(t.adminToken, { type: "bearer" });

  it("abrir: 201 y el activo pasa a mantenimiento", async () => {
    const res = await open(t.data.assets.free);

    expect(res.status).toBe(201);
    expect(res.body.data.fechaFin).toBeNull();
    expect((await getAsset(t.data.assets.free)).body.data.estado).toBe(
      "mantenimiento",
    );
  });

  it("abrir otro sobre el mismo activo: 409", async () => {
    await open(t.data.assets.free);

    expect((await open(t.data.assets.free)).status).toBe(409);
  });

  it("abrir sobre un activo dado de baja: 404", async () => {
    expect((await open(t.data.assets.decommissioned)).status).toBe(404);
  });

  it("cerrar con fecha anterior al inicio: 400", async () => {
    const res = await close(t.data.openMaintenanceId, {
      fechaFin: "2026-10-10",
      resultado: "operativo",
    });

    expect(res.status).toBe(400);
  });

  it("cerrar: 200 y el activo vuelve a operativo", async () => {
    const res = await close(t.data.openMaintenanceId, {
      fechaFin: "2026-10-20",
      resultado: "operativo",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.fechaFin).toBe("2026-10-20");
    expect((await getAsset(t.data.assets.inMaintenance)).body.data.estado).toBe(
      "operativo",
    );
  });

  it("cerrar con resultado fuera_de_servicio", async () => {
    await close(t.data.openMaintenanceId, {
      fechaFin: "2026-10-20",
      resultado: "fuera_de_servicio",
    });

    expect((await getAsset(t.data.assets.inMaintenance)).body.data.estado).toBe(
      "fuera_de_servicio",
    );
  });

  it("cerrar dos veces: 409", async () => {
    const body = { fechaFin: "2026-10-20", resultado: "operativo" };
    await close(t.data.openMaintenanceId, body);

    expect((await close(t.data.openMaintenanceId, body)).status).toBe(409);
  });

  it("body inválido al cerrar: 400 con detalles por campo", async () => {
    const res = await close(t.data.openMaintenanceId, { resultado: "roto" });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("rol usuario: 403 al abrir y al cerrar", async () => {
    expect((await open(t.data.assets.free, t.userToken)).status).toBe(403);
    expect(
      (
        await close(
          t.data.openMaintenanceId,
          { fechaFin: "2026-10-20", resultado: "operativo" },
          t.userToken,
        )
      ).status,
    ).toBe(403);
  });
});
