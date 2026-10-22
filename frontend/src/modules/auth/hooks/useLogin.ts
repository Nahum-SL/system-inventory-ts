import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/auth.api";
import { sessionKey } from "./useSessions";

import { tokenStorage } from "../../../shared/lib/token-storage";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      tokenStorage.set(res.data.accessToken);
      queryClient.setQueryData(sessionKey, res.data.user);
    },
  });
}