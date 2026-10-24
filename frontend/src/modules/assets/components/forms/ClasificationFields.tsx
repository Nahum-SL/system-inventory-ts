import { useFormContext } from "react-hook-form";
// COMPONENTES ATOMICOS
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// CATALOG OPTIONS
import {
  BrandOptions,
  CategoryOptions,
} from "@/modules/catalogs/components/options";
// SCHEMA - ASSET FORM
import type { EditAssetInput } from "../../schema/asset-form.schema";

export default function ClassificationFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EditAssetInput>();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField label="Marca" error={errors.marcaId?.message}>
        <select className={controlClass} {...register("marcaId")}>
          <BrandOptions />
        </select>
      </FormField>

      <FormField label="Categoría" error={errors.categoriaId?.message}>
        <select className={controlClass} {...register("categoriaId")}>
          <CategoryOptions />
        </select>
      </FormField>
    </div>
  );
}
