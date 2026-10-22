import { useQueryClient } from "@tanstack/react-query";
import { sessionKey } from "./useSessions";
import { tokenStorage } from "../../../shared/lib/token-storage";

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    tokenStorage.clear();
    // Quita los datos del usuario anterior, salvo la sesión.
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== sessionKey[0],
    });

    // Notifica a los observadores activos (ProtectedRoute) que ya no hay sesión.

    queryClient.setQueryData(sessionKey, null);
  };
}
