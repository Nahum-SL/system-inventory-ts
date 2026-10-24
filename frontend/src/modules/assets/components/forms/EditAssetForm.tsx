import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
// HOOKS
import { useUpdateAsset } from "../../hooks/use-asset-mutation";
// SCHEMA - ASSET FORM
import {
  editAssetSchema,
  type EditAssetInput,
  type EditAssetValues,
} from "../../schema/asset-form.schema";
// TYPES
import type { Asset } from "../../types";
// COMPONENTS FORM
import ClassificationFields from "./ClasificationFields";
import DetailsFields from "./DetailFields";

interface Props {
  asset: Asset;
  onDone: () => void;
}

export default function EditAssetForm({ asset, onDone }: Props) {
  const mutation = useUpdateAsset(asset.id);
  const methods = useForm<EditAssetInput, unknown, EditAssetValues>({
    resolver: zodResolver(editAssetSchema),
    defaultValues: {
      marcaId: String(asset.marcaId),
      categoriaId: String(asset.categoriaId),
      fechaIngreso: asset.fechaIngreso,
      descripcion: asset.descripcion,
    },
  });

  const onSubmit = methods.handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Datos actualizados");
        onDone();
      },
    }),
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <p className="text-xs text-slate-500">
          El código y el área no se editan aquí: el código lo usa el QR y el
          área se cambia trasladando.
        </p>

        <ClassificationFields />
        <DetailsFields />

        {mutation.error && <Alert>{mutation.error.message}</Alert>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onDone}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
