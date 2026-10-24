import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import { todayLocal } from "@/shared/lib/date";
import { useCreateAsset } from "../../hooks/use-asset-mutation";
// SCHEMA - ASSET FORM
import {
  createAssetSchema,
  type CreateAssetInput,
  type CreateAssetValues,
} from "../../schema/asset-form.schema";
// TYPES
import type { Asset } from "../../types";
// COMPONENTS FORMS
import ClassificationFields from "./ClasificationFields";
import DetailsFields from "./DetailFields";
import IdentityFields from "./IndentityFields";

interface Props {
  onCreated: (asset: Asset) => void;
  onCancel: () => void;
}

export default function CreateAssetForm({ onCreated, onCancel }: Props) {
  const mutation = useCreateAsset();
  const methods = useForm<CreateAssetInput, unknown, CreateAssetValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      marcaId: "",
      categoriaId: "",
      areaId: "",
      codigoInventario: "",
      fechaIngreso: todayLocal(),
      descripcion: "",
    },
  });

  const onSubmit = methods.handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (asset) => {
        toast.success(`${asset.codigoInventario} registrado`);
        onCreated(asset);
      },
    }),
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
      >
        <IdentityFields />
        <ClassificationFields />
        <DetailsFields />

        {mutation.error && <Alert>{mutation.error.message}</Alert>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Registrar activo
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
