import { api } from "../../../shared/lib/api-client";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { LoginFormValues } from "../schema";
import type { User } from "../types";

export const login = (values: LoginFormValues) =>
  api.post<ApiResponse<{ accessToken: string; user: User }>>(
    "/auth/login",
    values,
  );

export const getMe = async (): Promise<User> =>
  (await api.get<ApiResponse<{ user: User }>>("/auth/me")).data.user;

export const logout = () => api.post<ApiResponse<null>>("/auth/logout");
