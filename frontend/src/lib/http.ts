const TOKEN_KEY = "token";

/**
 * Único archivo que toca el token. Si luego pasas a cookie httpOnly, solo cambia este.
 */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sin almacenamiento: la sesión dura lo que dure la pestaña */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};

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
  const token = tokenStorage.get();
  const headers = new Headers(init.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  if (!res.ok) {
    let body: { message?: string; details?: ErrorDetail[] } = {};
    try {
      body = await res.json();
    } catch {
      /* respuesta sin JSON */
    }

    // Token vencido o inválido: se limpia y se avisa a la sesión.
    if (res.status === 401 && token) {
      tokenStorage.clear();
      window.dispatchEvent(new Event("auth:expired"));
    }

    throw new ApiError(
      body.message ?? "Error inesperado",
      res.status,
      body.details,
    );
  }

  return res;
}

export const api = {
  get: async <T>(path: string): Promise<T> => (await request(path)).json(),
  getText: async (path: string): Promise<string> =>
    (await request(path)).text(),
  post: async <T>(path: string, body?: unknown): Promise<T> =>
    (
      await request(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      })
    ).json(),
  patch: async <T>(path: string, body?: unknown): Promise<T> =>
    (
      await request(path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      })
    ).json(),
};
