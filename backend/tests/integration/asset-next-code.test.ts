import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

describe("Código sugerido para un activo nuevo", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const nextCode = async () => {
    const res = await request(app)
      .get("/api/assets/next-code")
      .auth(t.adminToken, { type: "bearer" });
    expect(res.status).toBe(200);
    return res.body.data.codigo as string;
  };

  const createAsset = async (codigoInventario: string) => {
    const base = await request(app)
      .get("/api/assets/code/INV-0001")
      .auth(t.adminToken, { type: "bearer" });

    const res = await request(app)
      .post("/api/assets")
      .auth(t.adminToken, { type: "bearer" })
      .send({
        codigoInventario,
        descripcion: "Activo de prueba",
        marcaId: base.body.data.marcaId,
        categoriaId: base.body.data.categoriaId,
        areaId: base.body.data.areaId,
        fechaIngreso: "2026-01-15",
      });
    expect(res.status).toBe(201);
    return res.body.data as { id: number };
  };

  it("sugiere el siguiente de la serie y no reutiliza el de una baja", async () => {
    const created = await createAsset("TST-0099");
    expect(await nextCode()).toBe("TST-0100");

    // Tras la baja su código sigue ocupado: la sugerencia no retrocede.
    const baja = await request(app)
      .post(`/api/assets/${created.id}/decommission`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ motivo: "Prueba de baja" });
    expect(baja.status).toBe(200);
    expect(await nextCode()).toBe("TST-0100");

    await createAsset("TST-0100");
    expect(await nextCode()).toBe("TST-0101");
  });

  it("rol usuario recibe 403", async () => {
    const res = await request(app)
      .get("/api/assets/next-code")
      .auth(t.userToken, { type: "bearer" });
    expect(res.status).toBe(403);
  });

  it("sin sesión recibe 401", async () => {
    const res = await request(app).get("/api/assets/next-code");
    expect(res.status).toBe(401);
  });
});
