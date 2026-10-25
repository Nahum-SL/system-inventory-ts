import { useMutation } from "@tanstack/react-query";
import { tokenStorage } from "@/shared/lib/token-storage";
import { changePassword } from "../api/auth.api";

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword({ currentPassword, newPassword }),
    onSuccess: (res) => tokenStorage.set(res.data.accessToken),
  });
}
