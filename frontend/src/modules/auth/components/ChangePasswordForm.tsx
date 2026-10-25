import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// HOOKS
import { useChangePassword } from "../hooks/useChangePassword";
// SCHEMA - AUTH
import {
  changePasswordSchema,
  type ChangePasswordInput,
  type ChangePasswordValues,
} from "../schema";

export default function ChangePasswordForm() {
  const mutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput, unknown, ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          "Contraseña actualizada. Las demás sesiones se cerraron.",
        );
        reset();
      },
    }),
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Cambiar contraseña
      </h2>

      <FormField
        label="Contraseña actual"
        error={errors.currentPassword?.message}
      >
        <input
          type="password"
          autoComplete="current-password"
          className={controlClass}
          {...register("currentPassword")}
        />
      </FormField>

      <FormField
        label="Nueva contraseña (mínimo 12 caracteres)"
        error={errors.newPassword?.message}
      >
        <input
          type="password"
          autoComplete="new-password"
          className={controlClass}
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        label="Repite la nueva contraseña"
        error={errors.confirmPassword?.message}
      >
        <input
          type="password"
          autoComplete="new-password"
          className={controlClass}
          {...register("confirmPassword")}
        />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <Button type="submit" loading={mutation.isPending}>
        Actualizar contraseña
      </Button>
    </form>
  );
}
