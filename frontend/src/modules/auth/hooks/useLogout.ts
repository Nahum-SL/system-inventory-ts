import { useQueryClient } from "@tanstack/react-query";
import { sessionKey } from "./useSessions";
import { tokenStorage } from "../../../shared/lib/token-storage";

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    tokenStorage.clear();
    queryClient.clear();
    queryClient.setQueryData(sessionKey, null);
  };
}