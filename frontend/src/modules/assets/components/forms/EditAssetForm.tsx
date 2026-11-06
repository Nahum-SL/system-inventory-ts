import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import ImagePicker, {
  type ImageValue,
} from "@/shared/components/ui/form/ImagePicker";
// HOOKS
import {
  useApplyImageChange,
  useUpdateAsset,
} from "../../hooks/use-asset-mutation";
// SCHEMA - ASSET FORM
import {
  editAssetSchema,
  type EditAssetInput,
  type EditAssetValues,
} from "../../schema/asset-form.schema";
// TYPES
import type { AssetCard } from "../../types";
// COMPONENTS
import AssetImage from "../AssetImage";
import ClassificationFields from "./ClasificationFields";
import DetailsFields from "./DetailFields";

interface Props {
  asset: AssetCard;
  onDone: () => void;
}

const KEEP: ImageValue = { kind: "keep" };

export default function EditAssetForm({ asset, onDone }: Props) {
  const mutation = useUpdateAsset(asset.id);
  const applyImage = useApplyImageChange(asset.id);

  const [image, setImage] = useState<ImageValue>(KEEP);
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const methods = useForm<EditAssetInput, unknown, EditAssetValues>({
    resolver: zodResolver(editAssetSchema),
    defaultValues: {
      marcaId: String(asset.marcaId),
      categoriaId: String(asset.categoriaId),
      fechaIngreso: asset.fechaIngreso,
      descripcion: asset.descripcion,
    },
  });

  const dataDirty = methods.formState.isDirty;
  const imageDirty = image.kind !== "keep";
  const busy = mutation.isPending || imageSaving;

  const finish = () => {
    setImage(KEEP);
    onDone();
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    setImageError(null);

    if (dataDirty) {
      try {
        await mutation.mutateAsync(values);
      } catch {
        return; // el error se muestra con `mutation.error`
      }
      // Los datos ya están guardados: un reintento no debe volver a enviarlos.
      methods.reset(methods.getValues());
    }

    if (imageDirty) {
      setImageSaving(true);
      try {
        await applyImage(image);
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : "Error desconocido.";
        setImageError(
          dataDirty
            ? `Los datos se guardaron, pero la imagen no: ${detail} Puedes reintentar.`
            : detail,
        );
        return;
      } finally {
        setImageSaving(false);
      }
    }

    toast.success("Cambios guardados");
    finish();
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <p className="text-xs text-slate-500">
          El código y el área no se editan aquí: el código lo usa el QR y el
          área se cambia trasladando.
        </p>

        <ClassificationFields />
        <DetailsFields />

        <ImagePicker
          value={image}
          onChange={setImage}
          disabled={busy}
          current={
            asset.imagenArchivo ? (
              <AssetImage asset={asset} className="w-full" />
            ) : null
          }
        />

        {mutation.error && <Alert>{mutation.error.message}</Alert>}
        {imageError && <Alert>{imageError}</Alert>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={finish}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={busy}
            disabled={!dataDirty && !imageDirty}
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
