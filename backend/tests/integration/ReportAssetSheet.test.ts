import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";
// Repeta la firma en parsePdf
import type { Response } from "supertest";

describe("Hoja de vida PDF de activos", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const url = (codigo: string) =>
    `/api/reports/export/asset-sheet/${encodeURIComponent(codigo)}`;

  const get = (codigo: string, token = t.adminToken) =>
    request(app).get(url(codigo)).auth(token, { type: "bearer" });

  /**
   * Supertest debe tratar la respuesta como binaria para evitar
   * que el contenido del PDF se convierta en texto.
   */
  const parsePdf = (
    res: Response,
    callback: (err: Error | null, body?: Buffer) => void,
  ) => {
    const chunks: Buffer[] = [];

    res.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    res.on("end", () => {
      callback(null, Buffer.concat(chunks));
    });

    res.on("error", (error: Error) => {
      callback(error);
    });
  };

  it("admin descarga un PDF válido", async () => {
    const res = await get("INV-0001").buffer(true).parse(parsePdf);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toContain(
      'attachment; filename="hoja-de-vida-INV-0001.pdf"',
    );
    expect(res.headers["cache-control"]).toBe("no-store");

    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("rol usuario recibe 403", async () => {
    const res = await get("INV-0001", t.userToken);

    expect(res.status).toBe(403);
  });

  it("sin sesión recibe 401", async () => {
    const res = await request(app).get(url("INV-0001"));

    expect(res.status).toBe(401);
  });

  it("código inexistente recibe 404", async () => {
    const res = await get("NO-EXISTE");

    expect(res.status).toBe(404);
  });

  it("un activo dado de baja también genera PDF", async () => {
    // Obtener el activo que se utilizará para la prueba.
    const asset = await request(app)
      .get("/api/assets/code/INV-0002")
      .auth(t.adminToken, { type: "bearer" });

    expect(asset.status).toBe(200);
    expect(asset.body.id).toBeDefined();

    // Dar de baja el activo.
    const decommission = await request(app)
      .post(`/api/assets/${asset.body.id}/decommission`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ motivo: "Prueba de baja" });

    expect(decommission.status).toBe(200);

    // La hoja de vida debe seguir disponible.
    const res = await get("INV-0002").buffer(true).parse(parsePdf);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe("%PDF-");
  });
});
