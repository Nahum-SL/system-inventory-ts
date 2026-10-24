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
// COMPONENTS
import { AreaOptions } from "../options";
// SCHEMA
import {
  positionSchema,
  type PositionInput,
  type PositionValues,
} from "../../schemas/catalog.schema";
// TYPE
import type { Position } from "../../types";

interface Props {
  item?: Position;
  open: boolean;
  onClose: () => void;
}

function PositionForm({ item, onClose }: Omit<Props, "open">) {
  const mutation = useSaveCatalogItem<PositionValues>(
    "/positions",
    catalogKeys.positions,
    item?.id,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PositionInput, unknown, PositionValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      areaId: item ? String(item.areaId) : "",
      nombre: item?.nombre ?? "",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(item ? "Cambios guardados" : "Cargo creado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Área" error={errors.areaId?.message}>
        <select className={controlClass} {...register("areaId")}>
          <AreaOptions />
        </select>
      </FormField>

      <FormField label="Nombre del cargo" error={errors.nombre?.message}>
        <input className={controlClass} {...register("nombre")} />
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

export default function PositionModal({ item, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "Editar cargo" : "Nuevo cargo"}
    >
      <PositionForm item={item} onClose={onClose} />
    </Modal>
  );
}
