import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// ATOMICS COMPONENTS 
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
// LIB - LOCAL DATE
import { todayLocal } from "@/shared/lib/date";
// HOOKS
import { useCreateAsset } from "../../hooks/use-asset-mutation";
// SCHEMA - ASSET
import {
  createAssetSchema,
  type CreateAssetInput,
  type CreateAssetValues,
} from "../../schema/asset-form.schema";
// TYPES
import type { Asset } from "../../types";
// COMPONENTS - FORM
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
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="space-y-6 p-4 sm:p-6">
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Identificación
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Define el código del activo y su área inicial.
              </p>
            </div>

            <IdentityFields />
          </section>

          <div className="border-t border-slate-100 dark:border-gray-800" />

          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Clasificación
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Selecciona la marca y la categoría correspondiente.
              </p>
            </div>

            <ClassificationFields />
          </section>

          <div className="border-t border-slate-100 dark:border-gray-800" />

          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Detalles adicionales
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Registra la fecha de ingreso y una descripción.
              </p>
            </div>

            <DetailsFields />
          </section>

          {mutation.error && <Alert>{mutation.error.message}</Alert>}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/40 sm:flex-row sm:justify-end sm:px-6">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            loading={mutation.isPending}
            className="w-full sm:w-auto"
          >
            Registrar activo
          </Button>
        </footer>
      </form>
    </FormProvider>
  );
}
