import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/lib/api-client";
import { getMe } from "../api/auth.api";
import type { User } from "../types";
import { tokenStorage } from "../../../shared/lib/token-storage";

export const sessionKey = ["auth", "me"] as const;

export function useSession() {
  return useQuery<User | null>({
    queryKey: sessionKey,
    queryFn: async () => {
      if (!tokenStorage.get()) return null;

      try {
        return await getMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: Infinity,
  });
}
