import { useMemo } from "react";
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
// HOOKS
import { useReturnAssignment } from "../../hooks/use-asset-mutation";
// SCHEMA - ACTIONS
import {
  returnAssignmentSchema,
  type ReturnAssignmentInput,
  type ReturnAssignmentValues,
} from "../../schema/activons.schema";
// TYPES
import type { AssetCard } from "../../types";

type CurrentAssignment = NonNullable<AssetCard["asignacionActual"]>;

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

function ReturnForm({
  assignment,
  onClose,
}: {
  assignment: CurrentAssignment;
  onClose: () => void;
}) {
  const mutation = useReturnAssignment(assignment.id);
  const schema = useMemo(
    () => returnAssignmentSchema(assignment.fechaInicio),
    [assignment.fechaInicio],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReturnAssignmentInput, unknown, ReturnAssignmentValues>({
    resolver: zodResolver(schema),
    defaultValues: { fechaFin: todayLocal(), condicionDevolucion: "" },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Devolución registrada");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-sm text-slate-600">
        {assignment.personaNombre} · {assignment.cargoNombre} · desde{" "}
        {assignment.fechaInicio}
      </p>

      <FormField label="Fecha de devolución" error={errors.fechaFin?.message}>
        <input
          type="date"
          min={assignment.fechaInicio}
          className={controlClass}
          {...register("fechaFin")}
        />
      </FormField>

      <FormField
        label="Condición de devolución"
        error={errors.condicionDevolucion?.message}
      >
        <textarea
          rows={2}
          className={controlClass}
          {...register("condicionDevolucion")}
        />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Registrar devolución
        </Button>
      </div>
    </form>
  );
}

export default function ReturnAssignmentModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Devolución de ${asset.codigoInventario}`}
    >
      {asset.asignacionActual && (
        <ReturnForm assignment={asset.asignacionActual} onClose={onClose} />
      )}
    </Modal>
  );
}
