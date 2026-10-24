import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// LIB - DATE
import { todayLocal } from "@/shared/lib/date";
// HOOKS - MUTATIONS
import { useCloseMaintenance } from "../../hooks/use-asset-mutation";
// SCHEMA - ASSET
import {
  closeMaintenanceSchema,
  type CloseMaintenanceInput,
  type CloseMaintenanceValues,
} from "../../schema/activons.schema";
// TYPES
import type { AssetCard } from "../../types";

type OpenMaintenance = NonNullable<AssetCard["mantenimientoAbierto"]>;

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

function CloseMaintenanceForm({
  maintenance,
  onClose,
}: {
  maintenance: OpenMaintenance;
  onClose: () => void;
}) {
  const mutation = useCloseMaintenance(maintenance.id);
  const schema = useMemo(
    () => closeMaintenanceSchema(maintenance.fecha),
    [maintenance.fecha],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CloseMaintenanceInput, unknown, CloseMaintenanceValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fechaFin: todayLocal(),
      resultado: "operativo",
      observaciones: "",
      costo: "",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Mantenimiento cerrado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-sm text-slate-600">
        {maintenance.descripcion} · desde {maintenance.fecha}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Fecha de fin" error={errors.fechaFin?.message}>
          <input
            type="date"
            min={maintenance.fecha}
            className={controlClass}
            {...register("fechaFin")}
          />
        </FormField>
        <FormField label="Resultado" error={errors.resultado?.message}>
          <select className={controlClass} {...register("resultado")}>
            <option value="operativo">Operativo</option>
            <option value="fuera_de_servicio">Fuera de servicio</option>
          </select>
        </FormField>
      </div>

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
        label="Costo final, S/ (vacío = conservar el registrado)"
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
          Cerrar mantenimiento
        </Button>
      </div>
    </form>
  );
}

export default function CloseMaintenanceModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cerrar mantenimiento de ${asset.codigoInventario}`}
    >
      {asset.mantenimientoAbierto && (
        <CloseMaintenanceForm
          maintenance={asset.mantenimientoAbierto}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
