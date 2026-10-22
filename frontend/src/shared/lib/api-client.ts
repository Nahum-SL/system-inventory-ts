import type { ApiErrorBody } from "../types/api.types";

/** Se dispara ante un 401 (salvo en el login) para que la sesión se invalide. */
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export interface ErrorDetail {
  field: string;
  message: string;
}

/** Error de la API con el formato { status, message, details? }. */
export class ApiError extends Error {
  status: number;
  details?: ErrorDetail[];

  constructor(message: string, status: number, details?: ErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    // same-origin: el navegador adjunta la cookie httpOnly; el JS nunca la ve.
    res = await fetch(`/api${path}`, {
      ...init,
      headers,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  if (!res.ok) {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = await res.json();
    } catch {
      /* respuesta sin JSON */
    }

    if (res.status === 401 && path !== "/auth/login") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(
      body.message ?? "Error inesperado",
      res.status,
      body.details,
    );
  }

  return res;
}

const withBody = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  get: async <T>(path: string): Promise<T> => (await request(path)).json(),
  getText: async (path: string): Promise<string> =>
    (await request(path)).text(),
  post: async <T>(path: string, body?: unknown): Promise<T> =>
    (await request(path, withBody("POST", body))).json(),
  patch: async <T>(path: string, body?: unknown): Promise<T> =>
    (await request(path, withBody("PATCH", body))).json(),
};
