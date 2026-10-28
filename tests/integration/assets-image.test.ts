import fs from "node:fs/promises";
import path from "node:path";
import request from "supertest";
import sharp from "sharp";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { env } from "../../src/config/env.js";
import { app, prepareTest } from "../setup/helpers.js";

const dir = path.resolve(env.IMAGES_DIR);
const FILE_RE = /^[0-9a-f-]{36}\.webp$/;

const png = (color = "#cc3300") =>
  sharp({
    create: { width: 2000, height: 1000, channels: 3, background: color },
  })
    .png()
    .toBuffer();

const exists = (name: string) =>
  fs.access(path.join(dir, name)).then(
    () => true,
    () => false,
  );

describe("Imagen del activo", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeAll(() => {
    // Igual que con la BD: nunca vaciar una carpeta que no sea de pruebas.
    if (!path.basename(dir).endsWith("-test")) {
      throw new Error("IMAGES_DIR de pruebas debe terminar en -test");
    }
  });

  beforeEach(async () => {
    t = await prepareTest();
    await fs.rm(dir, { recursive: true, force: true });
  });

  const idOf = async (codigo = "INV-0001") =>
    (
      await request(app)
        .get(`/api/assets/code/${codigo}`)
        .auth(t.adminToken, { type: "bearer" })
    ).body.data.id as number;

  const put = (
    id: number,
    body: Buffer,
    type = "image/png",
    token = t.adminToken,
  ) =>
    request(app)
      .put(`/api/assets/${id}/imagen`)
      .auth(token, { type: "bearer" })
      .set("Content-Type", type)
      .send(body);

  const getImage = (id: number, token = t.adminToken) =>
    request(app)
      .get(`/api/assets/${id}/imagen`)
      .auth(token, { type: "bearer" });

  it("subir un PNG: 200, se guarda como WebP de máximo 1200 px y se puede leer", async () => {
    const id = await idOf();
    const res = await put(id, await png());

    expect(res.status).toBe(200);
    const name = res.body.data.imagenArchivo as string;
    expect(name).toMatch(FILE_RE);
    expect(await exists(name)).toBe(true);

    const img = await getImage(id);
    expect(img.status).toBe(200);
    expect(img.headers["content-type"]).toContain("image/webp");

    const meta = await sharp(img.body as Buffer).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(600);
  });

  it("la ficha por código incluye imagenArchivo", async () => {
    const id = await idOf();
    const { body } = await put(id, await png());

    const card = await request(app)
      .get("/api/assets/code/INV-0001")
      .auth(t.adminToken, { type: "bearer" });

    expect(card.body.data.imagenArchivo).toBe(body.data.imagenArchivo);
  });

  it("reemplazar: queda la nueva y se borra la anterior", async () => {
    const id = await idOf();
    const first = (await put(id, await png("#ff0000"))).body.data.imagenArchivo;
    const second = (await put(id, await png("#0000ff"))).body.data
      .imagenArchivo;

    expect(second).not.toBe(first);
    expect(await exists(first)).toBe(false);
    expect(await exists(second)).toBe(true);
  });

  it("eliminar: 200, imagenArchivo null y el archivo desaparece", async () => {
    const id = await idOf();
    const name = (await put(id, await png())).body.data.imagenArchivo;

    const res = await request(app)
      .delete(`/api/assets/${id}/imagen`)
      .auth(t.adminToken, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(res.body.data.imagenArchivo).toBeNull();
    expect(await exists(name)).toBe(false);
    expect((await getImage(id)).status).toBe(404);
  });

  it("contenido que no es imagen (aunque diga image/png): 400", async () => {
    const res = await put(await idOf(), Buffer.from("esto no es una imagen"));

    expect(res.status).toBe(400);
  });

  it("tipo de contenido no permitido: 400", async () => {
    const res = await put(await idOf(), await png(), "image/gif");

    expect(res.status).toBe(400);
  });

  it("más de 12 MB: 400", async () => {
    const res = await put(await idOf(), Buffer.alloc(12 * 1024 * 1024 + 1));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("12 MB");
  });

  it("rol usuario: 403 al subir y al borrar, 200 al leer", async () => {
    const id = await idOf();
    await put(id, await png());

    expect((await put(id, await png(), "image/png", t.userToken)).status).toBe(
      403,
    );
    expect(
      (
        await request(app)
          .delete(`/api/assets/${id}/imagen`)
          .auth(t.userToken, { type: "bearer" })
      ).status,
    ).toBe(403);
    expect((await getImage(id, t.userToken)).status).toBe(200);
  });

  it("sin token: 401", async () => {
    const id = await idOf();

    expect((await request(app).get(`/api/assets/${id}/imagen`)).status).toBe(
      401,
    );
  });

  it("activo inexistente o sin imagen: 404", async () => {
    expect((await put(999999, await png())).status).toBe(404);
    expect((await getImage(999999)).status).toBe(404);
    expect((await getImage(await idOf())).status).toBe(404);
  });
});
