import { api } from "@/shared/lib/api-client";
// Manejo de errores HTTP
import type { ApiResponse, ListResponse } from "@/shared/types/api.types";
// SCHEMAS
import type {
  CreateUserValues,
  EditUserValues,
  ResetPasswordValues,
} from "../schemas/users.schema";
// TYPE
import type { UserAccount } from "../types";

export const listUsers = async () =>
  (await api.get<ListResponse<UserAccount>>("/users")).data;

export const createUser = (values: CreateUserValues) =>
  api.post<ApiResponse<UserAccount>>("/users", values);

export const updateUser = (id: number, values: EditUserValues) =>
  api.patch<ApiResponse<UserAccount>>(`/users/${id}`, values);

export const resetUserPassword = (id: number, values: ResetPasswordValues) =>
  api.patch<ApiResponse<null>>(`/users/${id}/password`, values);
