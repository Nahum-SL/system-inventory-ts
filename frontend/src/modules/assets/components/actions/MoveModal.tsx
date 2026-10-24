import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// MODULO - CATALOGS
import { AreaOptions } from "@/modules/catalogs";
// HOOKS
import { useMoveAsset } from "../../hooks/use-asset-mutation";
// SCHEMA
import {
  moveSchema,
  type MoveInput,
  type MoveValues,
} from "../../schema/activons.schema";
// TYPES
import type { AssetCard } from "../../types";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

function MoveForm({ asset, onClose }: Omit<Props, "open">) {
  const mutation = useMoveAsset(asset.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MoveInput, unknown, MoveValues>({
    resolver: zodResolver(moveSchema),
    defaultValues: { areaDestinoId: "", motivo: "" },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Activo trasladado");
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-sm text-slate-600">Área actual: {asset.areaNombre}</p>

      <FormField label="Área de destino" error={errors.areaDestinoId?.message}>
        <select className={controlClass} {...register("areaDestinoId")}>
          <AreaOptions excludeId={asset.areaId} />
        </select>
      </FormField>

      <FormField label="Motivo (opcional)" error={errors.motivo?.message}>
        <input className={controlClass} {...register("motivo")} />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Trasladar
        </Button>
      </div>
    </form>
  );
}

export default function MoveModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Trasladar ${asset.codigoInventario}`}
    >
      <MoveForm asset={asset} onClose={onClose} />
    </Modal>
  );
}
