import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// Componentes Atomicos
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
/// LIB - MANEJO DEL DATE
import { todayLocal } from "@/shared/lib/date";
// MODULO - CATALOGS
import { PersonOptions, PositionOptions } from "@/modules/catalogs";
// HOOKS
import { useAssignAsset } from "../../hooks/use-asset-mutation";
// SCHEMA - ACTIONS
import {
  assignSchema,
  type AssignInput,
  type AssignValues,
} from "../../schema/activons.schema";
// TYPES
import type { AssetCard } from "../../types";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

function AssignForm({ asset, onClose }: Omit<Props, "open">) {
  const mutation = useAssignAsset(asset.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignInput, unknown, AssignValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      personaId: "",
      cargoId: "",
      fechaInicio: todayLocal(),
      condicionEntrega: "",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Activo asignado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Persona" error={errors.personaId?.message}>
        <select className={controlClass} {...register("personaId")}>
          <PersonOptions />
        </select>
      </FormField>

      <FormField label="Cargo" error={errors.cargoId?.message}>
        <select className={controlClass} {...register("cargoId")}>
          <PositionOptions />
        </select>
      </FormField>

      <FormField label="Fecha de entrega" error={errors.fechaInicio?.message}>
        <input
          type="date"
          className={controlClass}
          {...register("fechaInicio")}
        />
      </FormField>

      <FormField
        label="Condición de entrega"
        error={errors.condicionEntrega?.message}
      >
        <textarea
          rows={2}
          className={controlClass}
          {...register("condicionEntrega")}
        />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Asignar
        </Button>
      </div>
    </form>
  );
}

export default function AssignModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Asignar ${asset.codigoInventario}`}
    >
      <AssignForm asset={asset} onClose={onClose} />
    </Modal>
  );
}
