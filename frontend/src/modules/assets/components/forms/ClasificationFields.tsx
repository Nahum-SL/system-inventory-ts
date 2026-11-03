import { Controller, useFormContext } from "react-hook-form";
// COMPONENTES ATOMICOS
import FormField from "@/shared/components/ui/form/FormField";
// SCHEMA - ASSET FORM
import type { CreateAssetInput } from "../../schema/asset-form.schema";
import {
  BrandSelect,
  CategorySelect,
} from "@/modules/catalogs/components/select";

export default function ClassificationFields() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateAssetInput>();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField label="Marca" error={errors.marcaId?.message}>
        <Controller
          control={control}
          name="marcaId"
          render={({ field }) => (
            <BrandSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(errors.marcaId)}
            />
          )}
        />
      </FormField>

      <FormField label="Categoría" error={errors.categoriaId?.message}>
        <Controller
          control={control}
          name="categoriaId"
          render={({ field }) => (
            <CategorySelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(errors.categoriaId)}
            />
          )}
        />
      </FormField>
    </div>
  );
}
