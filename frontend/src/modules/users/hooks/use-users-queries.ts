import { useQuery } from "@tanstack/react-query";
import { listUsers } from "../api/users.api";

export const userKeys = { all: ["users"] as const };

export const useUsers = () =>
  useQuery({ queryKey: userKeys.all, queryFn: listUsers });
