import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTS ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
// CONSTANTS THEME
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// HOOKS
import { useUpdateUser } from "../hooks/use-users-mutation";
import { useSession } from "@/modules/auth";
// SCHEMA
import {
  editUserSchema,
  type EditUserInput,
  type EditUserValues,
} from "../schemas/users.schema";
// TYPES
import type { UserAccount } from "../types";

interface Props {
  user: UserAccount;
  open: boolean;
  onClose: () => void;
}

function EditUserForm({ user, onClose }: Omit<Props, "open">) {
  const mutation = useUpdateUser(user.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserInput, unknown, EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      rol: user.rol,
      activo: String(user.activo) as "true" | "false",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Usuario actualizado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Rol" error={errors.rol?.message}>
        <select className={controlClass} {...register("rol")}>
          <option value="usuario">Usuario (consulta)</option>
          <option value="admin">Administrador</option>
        </select>
      </FormField>

      <FormField label="Estado de la cuenta" error={errors.activo?.message}>
        <select className={controlClass} {...register("activo")}>
          <option value="true">Activa</option>
          <option value="false">Desactivada (no puede iniciar sesión)</option>
        </select>
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

export default function EditUserModal({ user, open, onClose }: Props) {
  const { data: me } = useSession();
  const isSelf = me?.id === user.id;

  return (
    <Modal open={open} onClose={onClose} title={`Editar @${user.username}`}>
      {isSelf ? (
        <div className="space-y-4">
          <Alert tone="info">
            No puedes cambiar tu propio rol ni desactivar tu cuenta.
          </Alert>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <EditUserForm user={user} onClose={onClose} />
      )}
    </Modal>
  );
}
