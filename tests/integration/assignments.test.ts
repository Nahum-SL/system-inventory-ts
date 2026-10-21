import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

describe("Asignaciones", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const assign = (assetId: number, token = t.adminToken) =>
    request(app)
      .post(`/api/assets/${assetId}/assignments`)
      .auth(token, { type: "bearer" })
      .send({
        personaId: t.data.workerId,
        cargoId: t.data.cargoId,
        fechaInicio: "2026-10-20",
        condicionEntrega: "Buen estado",
      });

  const giveBack = (assignmentId: number, body: object = {}) =>
    request(app)
      .patch(`/api/assignments/${assignmentId}/return`)
      .auth(t.adminToken, { type: "bearer" })
      .send({
        fechaFin: "2026-10-25",
        condicionDevolucion: "Con rayones",
        ...body,
      });

  it("asignar un activo libre: 201", async () => {
    const res = await assign(t.data.assets.free);

    expect(res.status).toBe(201);
    expect(res.body.data.fechaFin).toBeNull();
  });

  it("asignar uno ya asignado: 409", async () => {
    expect((await assign(t.data.assets.assigned)).status).toBe(409);
  });

  it("asignar uno en mantenimiento: 409", async () => {
    expect((await assign(t.data.assets.inMaintenance)).status).toBe(409);
  });

  it("asignar uno dado de baja: 404", async () => {
    expect((await assign(t.data.assets.decommissioned)).status).toBe(404);
  });

  it("devolver: 200, y luego se puede asignar de nuevo", async () => {
    const res = await giveBack(t.data.openAssignmentId);

    expect(res.status).toBe(200);
    expect(res.body.data.fechaFin).toBe("2026-10-25");
    expect((await assign(t.data.assets.assigned)).status).toBe(201);
  });

  it("devolver con fecha anterior al inicio: 400", async () => {
    expect(
      (await giveBack(t.data.openAssignmentId, { fechaFin: "2026-09-01" }))
        .status,
    ).toBe(400);
  });

  it("devolver dos veces: 409", async () => {
    await giveBack(t.data.openAssignmentId);

    expect((await giveBack(t.data.openAssignmentId)).status).toBe(409);
  });

  it("el historial conserva la asignación cerrada", async () => {
    await giveBack(t.data.openAssignmentId);

    const res = await request(app)
      .get(`/api/assets/${t.data.assets.assigned}/assignments`)
      .auth(t.adminToken, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].fechaFin).toBe("2026-10-25");
  });

  it("concurrencia: dos asignaciones simultáneas, una gana y otra recibe 409", async () => {
    const results = await Promise.all([
      assign(t.data.assets.free),
      assign(t.data.assets.free),
    ]);
    const statuses = results.map((r) => r.status).sort();

    expect(statuses).toEqual([201, 409]);
  });

  it("rol usuario: 403 al asignar, 200 al consultar el historial", async () => {
    expect((await assign(t.data.assets.free, t.userToken)).status).toBe(403);

    const res = await request(app)
      .get(`/api/assets/${t.data.assets.assigned}/assignments`)
      .auth(t.userToken, { type: "bearer" });

    expect(res.status).toBe(200);
  });
});
