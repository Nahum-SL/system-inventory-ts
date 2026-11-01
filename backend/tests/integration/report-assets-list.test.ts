import request from "supertest";
import type { Response } from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

describe("Listado de activos en PDF", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const URL = "/api/reports/export/assets-pdf";

  const get = (query = "", token = t.adminToken) =>
    request(app).get(`${URL}${query}`).auth(token, { type: "bearer" });

  /** Supertest debe tratar la respuesta como binaria para no convertir el PDF en texto. */
  const parsePdf = (
    res: Response,
    callback: (err: Error | null, body?: Buffer) => void,
  ) => {
    const chunks: Buffer[] = [];
    res.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    res.on("end", () => callback(null, Buffer.concat(chunks)));
    res.on("error", (error: Error) => callback(error));
  };

  const expectPdf = (res: request.Response) => {
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toMatch(
      /^attachment; filename="listado-activos_\d{4}-\d{2}-\d{2}\.pdf"$/,
    );
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe("%PDF-");
  };

  it("admin descarga el listado sin filtros", async () => {
    expectPdf(await get().buffer(true).parse(parsePdf));
  });

  it("admin descarga el listado con filtros y bajas incluidas", async () => {
    const res = await get("?q=INV&asignacion=libre&incluirBajas=true")
      .buffer(true)
      .parse(parsePdf);

    expectPdf(res);
  });

  it("genera un PDF válido aunque ningún activo coincida con los filtros", async () => {
    const res = await get("?q=zzz-no-existe").buffer(true).parse(parsePdf);

    expectPdf(res);
  });

  it("incluye un activo dado de baja sin romperse", async () => {
    // Activo nuevo: sin asignaciones ni mantenimientos, así la baja es válida.
    const base = await request(app)
      .get("/api/assets/code/INV-0001")
      .auth(t.adminToken, { type: "bearer" });

    const created = await request(app)
      .post("/api/assets")
      .auth(t.adminToken, { type: "bearer" })
      .send({
        codigoInventario: "INV-BAJA-LISTA",
        descripcion: "Activo de prueba para el listado",
        marcaId: base.body.data.marcaId,
        categoriaId: base.body.data.categoriaId,
        areaId: base.body.data.areaId,
        fechaIngreso: "2026-01-15",
      });

    expect(created.status).toBe(201);

    const decommission = await request(app)
      .post(`/api/assets/${created.body.data.id}/decommission`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ motivo: "Prueba de baja" });

    expect(decommission.status).toBe(200);

    const conBajas = await get("?incluirBajas=true")
      .buffer(true)
      .parse(parsePdf);
    expectPdf(conBajas);

    const sinBajas = await get().buffer(true).parse(parsePdf);
    expectPdf(sinBajas);

    // Con la baja incluida el listado tiene una fila más, así que pesa más.
    expect((conBajas.body as Buffer).length).toBeGreaterThan(
      (sinBajas.body as Buffer).length,
    );
  });

  it("rechaza un estado inválido con 400", async () => {
    const res = await get("?estado=roto");

    expect(res.status).toBe(400);
  });

  it("rechaza incluirBajas con un valor que no es true/false", async () => {
    const res = await get("?incluirBajas=quizas");

    expect(res.status).toBe(400);
  });

  it("rol usuario recibe 403", async () => {
    const res = await get("", t.userToken);

    expect(res.status).toBe(403);
  });

  it("sin sesión recibe 401", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(401);
  });
});
