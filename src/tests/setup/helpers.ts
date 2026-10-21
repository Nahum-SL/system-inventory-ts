import request from "supertest";
import app from "../../app.js";
import { ADMIN, USER, resetDatabase, seedTestData } from "./db.js";

export { app };

export async function loginAs(credentials: {
  username: string;
  password: string;
}): Promise<string> {
  const res = await request(app).post("/api/auth/login").send(credentials);

  if (res.status !== 200) {
    throw new Error(
      `Login de prueba falló (${res.status}): ${JSON.stringify(res.body)}`,
    );
  }

  return res.body.data.accessToken as string;
}

/** Deja la BD en su estado inicial y devuelve los datos y tokens de ambos roles. */
export async function prepareTest() {
  await resetDatabase();
  const data = await seedTestData();
  const [adminToken, userToken] = await Promise.all([
    loginAs(ADMIN),
    loginAs(USER),
  ]);

  return { data, adminToken, userToken };
}
