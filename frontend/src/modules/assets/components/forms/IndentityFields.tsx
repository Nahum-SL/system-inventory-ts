import { Controller, useFormContext } from "react-hook-form";
// COMPONENTES ATOMICOS
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// SCHEMA
import type { CreateAssetInput } from "../../schema/asset-form.schema";
import { AreaSelect } from "@/modules/catalogs/components/select";

export default function IdentityFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateAssetInput>();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField
        label="Código de inventario"
        error={errors.codigoInventario?.message}
      >
        <input
          className={controlClass}
          placeholder="INV-0011"
          autoCapitalize="characters"
          {...register("codigoInventario")}
        />
      </FormField>

      <FormField label="Área inicial" error={errors.areaId?.message}>
        <Controller
          control={control}
          name="areaId"
          render={({ field }) => (
            <AreaSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(errors.areaId)}
            />
          )}
        />
      </FormField>
    </div>
  );
}
