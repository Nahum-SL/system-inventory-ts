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
import { useDecommission } from "../../hooks/use-asset-mutation";
// SCHEMA - INPUTS ASSETS
import {
  decommissionSchema,
  type DecommissionInput,
  type DecommissionValues,
} from "../../schema/activons.schema";
// TYPES
import type { AssetCard } from "../../types";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
  /** Se llama tras una baja exitosa (por ejemplo, para volver a la lista). */
  onDone: () => void;
}

function DecommissionForm({ asset, onClose, onDone }: Omit<Props, "open">) {
  const mutation = useDecommission(asset.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DecommissionInput, unknown, DecommissionValues>({
    resolver: zodResolver(decommissionSchema),
    defaultValues: { motivo: "" },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(`${asset.codigoInventario} dado de baja`);
        onDone();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Alert tone="warning">
        El activo saldrá de las listas y búsquedas. Su historial se conserva y
        esta acción no se puede deshacer desde la aplicación.
      </Alert>

      <FormField label="Motivo de la baja" error={errors.motivo?.message}>
        <textarea rows={3} className={controlClass} {...register("motivo")} />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger" loading={mutation.isPending}>
          Dar de baja
        </Button>
      </div>
    </form>
  );
}

export default function DecommissionModal({
  asset,
  open,
  onClose,
  onDone,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Dar de baja ${asset.codigoInventario}`}
    >
      <DecommissionForm asset={asset} onClose={onClose} onDone={onDone} />
    </Modal>
  );
}
