import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// Componentes Atomicos
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";

import { useChangeStatus } from "@/modules/assets/hooks/use-asset-mutation";
// Schema - Activos
import {
  changeStatusSchema,
  type ChangeStatusInput,
  type ChangeStatusValues,
} from "@/modules/assets/schema/asset-status.schema";
import type { AssetCard } from "../../types";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

function ChangeStatusForm({ asset, onClose }: Omit<Props, "open">) {
  const mutation = useChangeStatus(asset.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeStatusInput, unknown, ChangeStatusValues>({
    resolver: zodResolver(changeStatusSchema),
    defaultValues: {
      estado:
        asset.estado === "fuera_de_servicio"
          ? "fuera_de_servicio"
          : "operativo",
    },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Estado actualizado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Nuevo estado" error={errors.estado?.message}>
        <select className={controlClass} {...register("estado")}>
          <option value="operativo">Operativo</option>
          <option value="fuera_de_servicio">Fuera de servicio</option>
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

export default function ChangeStatusModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cambiar estado de ${asset.codigoInventario}`}
    >
      <ChangeStatusForm asset={asset} onClose={onClose} />
    </Modal>
  );
}
