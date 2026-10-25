import { useMutation, useQueryClient } from "@tanstack/react-query";
// API
import { createUser, resetUserPassword, updateUser } from "../api/users.api";
// SCHEMA - USER
import type {
  CreateUserValues,
  EditUserValues,
  ResetPasswordValues,
} from "../schemas/users.schema";
// keys
import { userKeys } from "./use-users-queries";

function useInvalidatingMutation<V>(fn: (values: V) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export const useCreateUser = () =>
  useInvalidatingMutation((v: CreateUserValues) => createUser(v));

export const useUpdateUser = (id: number) =>
  useInvalidatingMutation((v: EditUserValues) => updateUser(id, v));

export const useResetUserPassword = (id: number) =>
  useInvalidatingMutation((v: ResetPasswordValues) => resetUserPassword(id, v));
