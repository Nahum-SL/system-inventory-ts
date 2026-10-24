import { useFormContext } from "react-hook-form";
// COMPONENTES ATOMICOS
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// SCHEMA
import type { EditAssetInput } from "../../schema/asset-form.schema";

export default function DetailsFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EditAssetInput>();

  return (
    <>
      <FormField label="Fecha de ingreso" error={errors.fechaIngreso?.message}>
        <input
          type="date"
          className={controlClass}
          {...register("fechaIngreso")}
        />
      </FormField>

      <FormField label="Descripción" error={errors.descripcion?.message}>
        <textarea
          rows={3}
          className={controlClass}
          {...register("descripcion")}
        />
      </FormField>
    </>
  );
}
