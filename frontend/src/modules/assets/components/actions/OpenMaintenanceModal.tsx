import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// Lib - DATE
import { todayLocal } from "@/shared/lib/date";
// HOOKS - MUTATION
import { useOpenMaintenance } from "../../hooks/use-asset-mutation";
// SCHEMA - ACTIONS ASSETS
import {
  openMaintenanceSchema,
  type OpenMaintenanceInput,
  type OpenMaintenanceValues,
} from "../../schema/activons.schema";
// TYPE - ASSET CARD
import type { AssetCard } from "../../types";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

function OpenMaintenanceForm({ asset, onClose }: Omit<Props, "open">) {
  const mutation = useOpenMaintenance(asset.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpenMaintenanceInput, unknown, OpenMaintenanceValues>({
    resolver: zodResolver(openMaintenanceSchema),
    defaultValues: {
      tipo: "correctivo",
      fecha: todayLocal(),
      descripcion: "",
      observaciones: "",
      costo: "",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Mantenimiento abierto");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo" error={errors.tipo?.message}>
          <select className={controlClass} {...register("tipo")}>
            <option value="correctivo">Correctivo</option>
            <option value="preventivo">Preventivo</option>
          </select>
        </FormField>
        <FormField label="Fecha de inicio" error={errors.fecha?.message}>
          <input type="date" className={controlClass} {...register("fecha")} />
        </FormField>
      </div>

      <FormField label="Descripción" error={errors.descripcion?.message}>
        <input className={controlClass} {...register("descripcion")} />
      </FormField>

      <FormField
        label="Observaciones (opcional)"
        error={errors.observaciones?.message}
      >
        <textarea
          rows={2}
          className={controlClass}
          {...register("observaciones")}
        />
      </FormField>

      <FormField
        label="Costo estimado, S/ (opcional)"
        error={errors.costo?.message}
      >
        <input
          inputMode="decimal"
          placeholder="0.00"
          className={controlClass}
          {...register("costo")}
        />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Abrir mantenimiento
        </Button>
      </div>
    </form>
  );
}

export default function OpenMaintenanceModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Mantenimiento de ${asset.codigoInventario}`}
    >
      <OpenMaintenanceForm asset={asset} onClose={onClose} />
    </Modal>
  );
}
