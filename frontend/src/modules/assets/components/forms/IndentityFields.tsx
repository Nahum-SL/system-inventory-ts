import { useFormContext } from "react-hook-form";
// COMPONENTES ATOMICOS
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// MODULO CATALOGS
import { AreaOptions } from "@/modules/catalogs";
// SCHEMA
import type { CreateAssetInput } from "../../schema/asset-form.schema";

export default function IdentityFields() {
  const {
    register,
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
        <select className={controlClass} {...register("areaId")}>
          <AreaOptions />
        </select>
      </FormField>
    </div>
  );
}
