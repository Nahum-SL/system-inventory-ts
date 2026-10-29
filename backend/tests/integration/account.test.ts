import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import db from "../../src/database/knex.js";
import { ADMIN, USER } from "../setup/db.js";
import { app, loginAs, prepareTest } from "../setup/helpers.js";

const NEW_PASSWORD = "nueva-clave-segura-1";

describe("Cuentas de usuario", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const idOf = async (username: string) =>
    Number((await db("usuarios").select("id").where({ username }).first())!.id);

  const me = (token: string) =>
    request(app).get("/api/auth/me").auth(token, { type: "bearer" });

  const patchUser = (id: number, body: object, token = t.adminToken) =>
    request(app)
      .patch(`/api/users/${id}`)
      .auth(token, { type: "bearer" })
      .send(body);

  it("cambiar contraseña: el token viejo deja de valer y el nuevo funciona", async () => {
    const res = await request(app)
      .post("/api/auth/change-password")
      .auth(t.userToken, { type: "bearer" })
      .send({ currentPassword: USER.password, newPassword: NEW_PASSWORD });

    expect(res.status).toBe(200);
    expect((await me(t.userToken)).status).toBe(401);
    expect((await me(res.body.data.accessToken)).status).toBe(200);
    await expect(
      loginAs({ username: USER.username, password: NEW_PASSWORD }),
    ).resolves.toBeTruthy();
  });

  it("contraseña actual incorrecta: 400 y la sesión sigue vigente", async () => {
    const res = await request(app)
      .post("/api/auth/change-password")
      .auth(t.userToken, { type: "bearer" })
      .send({
        currentPassword: "otra-clave-equivocada",
        newPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(400);
    expect((await me(t.userToken)).status).toBe(200);
  });

  it("desactivar una cuenta corta su sesión y bloquea el login", async () => {
    const res = await patchUser(await idOf(USER.username), { activo: false });

    expect(res.status).toBe(200);
    expect((await me(t.userToken)).status).toBe(401);

    const login = await request(app).post("/api/auth/login").send(USER);
    expect(login.status).toBe(401);
    expect(login.body.message).toContain("desactivada");
  });

  it("un admin no puede desactivarse a sí mismo: 409", async () => {
    expect(
      (await patchUser(await idOf(ADMIN.username), { activo: false })).status,
    ).toBe(409);
  });

  it("el admin restablece una contraseña y cierra las sesiones de esa cuenta", async () => {
    const res = await request(app)
      .patch(`/api/users/${await idOf(USER.username)}/password`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ password: NEW_PASSWORD });

    expect(res.status).toBe(200);
    expect((await me(t.userToken)).status).toBe(401);
    await expect(
      loginAs({ username: USER.username, password: NEW_PASSWORD }),
    ).resolves.toBeTruthy();
  });

  it("rol usuario: 403 al modificar cuentas", async () => {
    expect(
      (
        await patchUser(
          await idOf(ADMIN.username),
          { rol: "usuario" },
          t.userToken,
        )
      ).status,
    ).toBe(403);
  });
});
