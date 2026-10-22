import { useEffect, useState, type ReactNode } from "react";
// import { api, tokenStorage } from "./http";
import { api } from "./api-client";
import { tokenStorage } from "./token-storage";

import type { ItemResponse } from "../types";
import type { User } from "../types";

import { AuthContext } from "./auth.type";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null);

  // Al abrir la app, si hay token se confirma con el servidor.
  useEffect(() => {
    if (!tokenStorage.get()) return;

    api
      .get<ItemResponse<{ user: User }>>("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  // El cliente HTTP avisa cuando el token deja de ser válido.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post<ItemResponse<{ accessToken: string; user: User }>>(
      "/auth/login",
      { username, password },
    );
    tokenStorage.set(res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
