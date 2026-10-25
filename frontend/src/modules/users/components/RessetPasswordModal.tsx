import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
// CONSTANT THEME
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// HOOKS
import { useResetUserPassword } from "../hooks/use-users-mutation";
// SCHEMAS
import {
  resetPasswordSchema,
  type ResetPasswordInput,
  type ResetPasswordValues,
} from "../schemas/users.schema";
// TYPES
import type { UserAccount } from "../types";

interface Props {
  user: UserAccount;
  open: boolean;
  onClose: () => void;
}

function ResetPasswordForm({ user, onClose }: Omit<Props, "open">) {
  const mutation = useResetUserPassword(user.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput, unknown, ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Contraseña restablecida");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Alert tone="warning">
        Se cerrarán las sesiones abiertas de esta cuenta. Entrégale la clave
        nueva en persona.
      </Alert>

      <FormField
        label="Nueva contraseña (mínimo 12 caracteres)"
        error={errors.password?.message}
      >
        <input
          type="password"
          autoComplete="new-password"
          className={controlClass}
          {...register("password")}
        />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Restablecer
        </Button>
      </div>
    </form>
  );
}

export default function ResetPasswordModal({ user, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Restablecer clave de @${user.username}`}
    >
      <ResetPasswordForm user={user} onClose={onClose} />
    </Modal>
  );
}
