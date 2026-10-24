import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// HOOKS
import { useSaveCatalogItem } from "../../hooks/use-catalog-mutations";
// KEYS
import { catalogKeys } from "../../hooks/use-catalog-queries";
// SCHEMA
import {
  nameSchema,
  type NameInput,
  type NameValues,
} from "../../schemas/catalog.schema";
// TYPES
import type { NamedItem, NamedKind } from "../../types";
// CONSTANTS
import { NAMED_LABELS } from "../../constants/namedLabels";

interface Props {
  kind: NamedKind;
  item?: NamedItem;
  open: boolean;
  onClose: () => void;
}

function NamedForm({ kind, item, onClose }: Omit<Props, "open">) {
  const { singular, path } = NAMED_LABELS[kind];
  const mutation = useSaveCatalogItem<NameValues>(
    path,
    catalogKeys[kind],
    item?.id,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameInput, unknown, NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { nombre: item?.nombre ?? "" },
  });

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          item
            ? "Cambios guardados"
            : `${singular[0]!.toUpperCase()}${singular.slice(1)} creada`,
        );
        onClose();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Nombre" error={errors.nombre?.message}>
        <input className={controlClass} autoFocus {...register("nombre")} />
      </FormField>

      {mutation.error && <Alert>{mutation.error.message}</Alert>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

export default function NamedItemModal({ kind, item, open, onClose }: Props) {
  const { singular } = NAMED_LABELS[kind];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? `Editar ${singular}` : `Nueva ${singular}`}
    >
      <NamedForm kind={kind} item={item} onClose={onClose} />
    </Modal>
  );
}
