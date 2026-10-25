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
// MODULES - CATALOG
import { PersonOptions } from "@/modules/catalogs";
// HOOKS
import { useCreateUser } from "@/modules/users/hooks/use-users-mutation";
import { useUsers } from "@/modules/users/hooks/use-users-queries";
// SCHEMAS
import {
  createUserSchema,
  type CreateUserInput,
  type CreateUserValues,
} from "../schemas/users.schema";

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const mutation = useCreateUser();
  const { data: users } = useUsers();
  const withAccount = (users ?? []).map((u) => u.personaId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput, unknown, CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      personaId: "",
      username: "",
      password: "",
      rol: "usuario",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Usuario creado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Persona" error={errors.personaId?.message}>
        <select className={controlClass} {...register("personaId")}>
          <PersonOptions excludeIds={withAccount} />
        </select>
      </FormField>
      <p className="-mt-2 text-xs text-slate-500">
        Solo aparecen personas sin cuenta. Si falta alguien, regístralo antes en
        Personas.
      </p>

      <FormField label="Usuario" error={errors.username?.message}>
        <input
          className={controlClass}
          autoCapitalize="none"
          autoComplete="off"
          {...register("username")}
        />
      </FormField>

      <FormField
        label="Contraseña inicial (mínimo 12 caracteres)"
        error={errors.password?.message}
      >
        <input
          type="password"
          autoComplete="new-password"
          className={controlClass}
          {...register("password")}
        />
      </FormField>

      <FormField label="Rol" error={errors.rol?.message}>
        <select className={controlClass} {...register("rol")}>
          <option value="usuario">Usuario (consulta)</option>
          <option value="admin">Administrador</option>
        </select>
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Crear usuario
        </Button>
      </div>
    </form>
  );
}

export default function CreateUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo usuario">
      <CreateUserForm onClose={onClose} />
    </Modal>
  );
}
