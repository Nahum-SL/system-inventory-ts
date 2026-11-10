import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// HOOKS
import { useSaveCatalogItem } from "../../hooks/use-catalog-mutations";
// KEYS
import { catalogKeys } from "../../hooks/use-catalog-queries";
// SCHEMA
import {
  personSchema,
  type PersonInput,
  type PersonValues,
} from "../../schemas/catalog.schema";
// TYPES
import type { Person } from "../../types";

interface Props {
  item?: Person;
  open: boolean;
  onClose: () => void;
}

function PersonForm({ item, onClose }: Omit<Props, "open">) {
  const mutation = useSaveCatalogItem<PersonValues & { tipodoc: string }>(
    "/people",
    catalogKeys.people,
    item?.id,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonInput, unknown, PersonValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      apellidos: item?.apellidos ?? "",
      nombres: item?.nombres ?? "",
      numerodoc: item?.numerodoc ?? "",
      telefono: item?.telefono ?? "",
      email: item?.email ?? "",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(
      { ...values, tipodoc: "DNI" },
      {
        onSuccess: () => {
          toast.success(item ? "Cambios guardados" : "Persona registrada");
          onClose();
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Apellidos" error={errors.apellidos?.message}>
          <input className={controlClass} {...register("apellidos")} />
        </FormField>
        <FormField label="Nombres" error={errors.nombres?.message}>
          <input className={controlClass} {...register("nombres")} />
        </FormField>
        <FormField label="DNI" error={errors.numerodoc?.message}>
          <input
            className={controlClass}
            inputMode="numeric"
            maxLength={8}
            {...register("numerodoc")}
          />
        </FormField>
        <FormField label="Teléfono (opcional)" error={errors.telefono?.message}>
          <input
            className={controlClass}
            inputMode="numeric" 
            {...register("telefono")}
          />
        </FormField>
      </div>

      <FormField label="Correo electrónico (opcional)" error={errors.email?.message}>
        <input
          className={controlClass}
          type="email"
          autoCapitalize="none"
          {...register("email")}
        />
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

export default function PersonModal({ item, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "Editar persona" : "Nueva persona"}
    >
      <PersonForm item={item} onClose={onClose} />
    </Modal>
  );
}
