
import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Check,
  History,
  MapPin,
  Package,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

import Alert from "@/shared/components/ui/Alert";
import FormField from "@/shared/components/ui/form/FormField";
import Modal from "@/shared/components/ui/dialog/Modal";

import { controlClass } from "@/shared/components/ui/Buttons/style.button";
import { todayLocal } from "@/shared/lib/date";

import {
  PersonSelect,
  PositionSelect,
} from "@/modules/catalogs";

import { useAssignAsset } from "../../hooks/use-asset-mutation";

import {
  assignSchema,
  type AssignInput,
  type AssignValues,
} from "../../schema/asset.schema";

import type { AssetCard } from "../../types";

import type { AssignablePerson } from "./AssignPersonPicker";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
  selectedPerson?: AssignablePerson | null;
  onViewHistory?: () => void;
}

function AssignForm({
  asset,
  onClose,
  selectedPerson,
  onViewHistory,
}: Omit<Props, "open">) {
  const mutation = useAssignAsset(asset.id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignInput, unknown, AssignValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      personaId: selectedPerson?.id ?? "",
      cargoId: "",
      fechaInicio: todayLocal(),
      condicionEntrega: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Activo asignado correctamente");
        onClose();
      },
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
    >
      {/* PERSONA SELECCIONADA */}
      {selectedPerson ? (
        <div
          className="
            flex items-center gap-4
            rounded-xl border border-[#34415f]
            bg-[#141e33] p-4
          "
        >
          <div
            className="
              flex size-16 shrink-0
              items-center justify-center
              rounded-full bg-indigo-500/15
              text-indigo-300
            "
          >
            <UserRound size={30} />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="
                truncate text-lg font-bold
                text-white
              "
            >
              {selectedPerson.nombre}
            </h3>

            {selectedPerson.documento && (
              <p className="mt-1 text-sm text-slate-400">
                Documento: {selectedPerson.documento}
              </p>
            )}

            <span
              className="
                mt-2 inline-flex items-center gap-1
                rounded-full bg-emerald-500/15
                px-2.5 py-1 text-xs font-semibold
                text-emerald-300
              "
            >
              <Check size={13} />
              Persona seleccionada
            </span>
          </div>
        </div>
      ) : (
        <FormField
          label="Persona responsable"
          error={errors.personaId?.message}
        >
          <Controller
            control={control}
            name="personaId"
            render={({ field }) => (
              <PersonSelect
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(errors.personaId)}
              />
            )}
          />
        </FormField>
      )}

      {/* VALIDACIÓN DE PERSONA */}
      {selectedPerson && errors.personaId && (
        <Alert>{errors.personaId.message}</Alert>
      )}

      {/* ACCIONES SUPERIORES */}
      <div
        className="
          grid grid-cols-2 gap-3
          border-t border-[#394764] pt-5
        "
      >
        <button
          type="button"
          onClick={() => {
            document
              .getElementById("assign-form-fields")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
          }}
          className="
            flex min-h-20 flex-col
            items-center justify-center
            gap-2 rounded-xl
            bg-indigo-600 px-3 py-4
            text-sm font-semibold text-white
            transition-colors
            hover:bg-indigo-500
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-indigo-400
          "
        >
          <UserRoundPlus size={23} />
          Completar datos
        </button>

        <button
          type="button"
          onClick={onViewHistory}
          disabled={!onViewHistory}
          className="
            flex min-h-20 flex-col
            items-center justify-center
            gap-2 rounded-xl
            bg-emerald-600 px-3 py-4
            text-sm font-semibold text-white
            transition-colors
            hover:bg-emerald-500
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-400
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <History size={23} />
          Ver historial
        </button>
      </div>

      {/* DATOS DEL ACTIVO */}
      <div
        className="
          space-y-3 rounded-xl
          border border-[#34415f]
          bg-[#141e33] p-4
        "
      >
        <p
          className="
            text-xs font-semibold uppercase
            tracking-wide text-slate-400
          "
        >
          Datos del activo
        </p>

        <div className="flex justify-between gap-3 text-sm">
          <span
            className="
              flex items-center gap-2
              text-slate-400
            "
          >
            <Package size={15} />
            Código
          </span>

          <strong className="text-right text-white">
            {asset.codigoInventario}
          </strong>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-400">
            Descripción
          </span>

          <span
            className="
              max-w-[60%] text-right
              font-medium text-white
            "
          >
            {asset.descripcion}
          </span>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-400">
            Marca
          </span>

          <span className="text-right font-medium text-white">
            {asset.marcaNombre ?? "Sin marca"}
          </span>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-400">
            Categoría
          </span>

          <span className="text-right font-medium text-white">
            {asset.categoriaNombre ?? "Sin categoría"}
          </span>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span
            className="
              flex items-center gap-2
              text-slate-400
            "
          >
            <MapPin size={15} />
            Ubicación
          </span>

          <span className="text-right font-medium text-white">
            {asset.areaNombre ?? "Sin área"}
          </span>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-400">
            Estado
          </span>

          <span
            className="
              text-right font-semibold
              text-emerald-400
            "
          >
            {asset.estado}
          </span>
        </div>
      </div>

      {/* FORMULARIO DE ASIGNACIÓN */}
      <div
        id="assign-form-fields"
        className="
          space-y-4 rounded-xl
          border border-[#34415f]
          bg-[#141e33] p-4
        "
      >
        <p
          className="
            text-xs font-semibold uppercase
            tracking-wide text-slate-400
          "
        >
          Datos de la asignación
        </p>

        <FormField
          label="Cargo"
          error={errors.cargoId?.message}
        >
          <Controller
            control={control}
            name="cargoId"
            render={({ field }) => (
              <PositionSelect
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(errors.cargoId)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Fecha de entrega"
          error={errors.fechaInicio?.message}
        >
          <input
            type="date"
            className={`${controlClass} w-full`}
            {...register("fechaInicio")}
          />
        </FormField>

        <FormField
          label="Condición de entrega"
          error={errors.condicionEntrega?.message}
        >
          <textarea
            rows={3}
            placeholder="Describe el estado del equipo al entregarlo..."
            className={`${controlClass} w-full resize-y`}
            {...register("condicionEntrega")}
          />
        </FormField>
      </div>

      {/* ERROR DE LA API */}
      {mutation.error && (
        <Alert>{mutation.error.message}</Alert>
      )}

      {/* ACCIONES FINALES */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={mutation.isPending}
          className="
            min-h-12 rounded-xl
            border border-[#394764]
            bg-[#141e33] px-3
            text-sm font-semibold text-white
            transition-colors
            hover:bg-[#26334e]
            disabled:opacity-50
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="
            flex min-h-12 items-center
            justify-center gap-2 rounded-xl
            bg-indigo-600 px-3
            text-sm font-semibold text-white
            transition-colors
            hover:bg-indigo-500
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Check size={18} />

          {mutation.isPending
            ? "Asignando..."
            : "Confirmar asignación"}
        </button>
      </div>
    </form>
  );
}

export default function AssignModal({
  asset,
  open,
  onClose,
  selectedPerson,
  onViewHistory,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Asignar activo"
      size="lg"
    >
      {open && (
        <AssignForm
          key={selectedPerson?.id ?? "manual"}
          asset={asset}
          onClose={onClose}
          selectedPerson={selectedPerson}
          onViewHistory={onViewHistory}
        />
      )}
    </Modal>
  );
}
