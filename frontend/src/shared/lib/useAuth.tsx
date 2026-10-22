import { useContext } from "react";

import type { AuthContextValue } from "./auth.type";
import { AuthContext } from "./auth.type";

export function useAuth(): AuthContextValue{
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}