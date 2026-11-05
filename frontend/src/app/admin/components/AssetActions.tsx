import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeftRight,
  CirclePower,
  ClipboardEdit,
  RotateCcw,
  UserRoundPlus,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
// UTILS
// ATOMIC COMPONENTS
import Button from "@/shared/components/ui/Buttons/button";
// COMPONENTES DE ACCIONES - MODULO ASSETS
import {
  AssetImageButtons,
  AssignModal,
  ChangeStatusModal,
  CloseMaintenanceModal,
  DecommissionModal,
  EditAssetModal,
  MoveModal,
  OpenMaintenanceModal,
  ReturnAssignmentModal,
  type AssetCard,
} from "@/modules/assets";
// COMPONENTS UI - ASSET ACTIONS
import type { ActionTone } from "@/shared/components/ui/Buttons/ActionTittle";
import type { ActionItem } from "@/shared/components/ui/actions/ExpandableActionGrid";
import ExpandableActionGrid from "@/shared/components/ui/actions/ExpandableActionGrid";
import { AssetSheetButton } from "@/modules/reports";

type ActionId =
  | "status"
  | "open-maintenance"
  | "close-maintenance"
  | "move"
  | "assign"
  | "return"
  | "edit";
type ModalName = ActionId | "decommission" | null;

interface ActionDef {
  label: string;
  Icon: LucideIcon;
  /** Si existe, el botón queda bloqueado y se muestra este texto. */
  disabledReason?: string;
}

export default function AssetActions({ asset }: { asset: AssetCard }) {
  const [modal, setModal] = useState<ModalName>(null);
  const navigate = useNavigate();
  const close = () => setModal(null);

  const assigned = Boolean(asset.asignacionActual);
  const inMaintenance = asset.estado === "mantenimiento";
  const hasOpenMaintenance = Boolean(asset.mantenimientoAbierto);
  const canAssign = asset.estado === "operativo" && !assigned;

  const defs: Record<ActionId, ActionDef> = {
    assign: {
      label: "Asignar",
      Icon: UserRoundPlus,
      disabledReason: canAssign
        ? undefined
        : "Solo se pueden asignar activos operativos.",
    },
    return: { label: "Registrar devolución", Icon: RotateCcw },
    move: { label: "Trasladar", Icon: ArrowLeftRight },
    status: {
      label: "Cambiar estado",
      Icon: CirclePower,
      disabledReason: inMaintenance
        ? "Hay un mantenimiento abierto. Ciérralo para cambiar el estado."
        : undefined,
    },
    "open-maintenance": { label: "Abrir mantenimiento", Icon: Wrench },
    "close-maintenance": { label: "Cerrar mantenimiento", Icon: Wrench },
    edit: { label: "Editar datos", Icon: ClipboardEdit },
  };

  const primaryId: ActionId = assigned
    ? "return"
    : hasOpenMaintenance
      ? "close-maintenance"
      : canAssign
        ? "assign"
        : "status";

  const available: ActionId[] = [
    assigned ? "return" : "assign",
    "move",
    hasOpenMaintenance ? "close-maintenance" : "open-maintenance",
    "status",
    "edit",
  ];
  const moreIds = available.filter((id) => id !== primaryId && id !== "move");

  const toItem = (id: ActionId, tone: ActionTone = "neutral"): ActionItem => ({
    id,
    label: defs[id].label,
    icon: defs[id].Icon,
    tone,
    disabledReason: defs[id].disabledReason,
    onClick: () => setModal(id),
  });

  // Mismas reglas que `decommission` en el backend.
  const decommissionBlock =
    inMaintenance || hasOpenMaintenance
      ? "Para dar de baja, primero cierra el mantenimiento."
      : assigned
        ? "Para dar de baja, primero registra la devolución."
        : undefined;

  return (
    <section
      aria-labelledby="asset-actions-title"
      className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800/40"
    >
      <h2
        id="asset-actions-title"
        className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100"
      >
        ¿Qué quieres hacer con este activo?
      </h2>

      <ExpandableActionGrid
        main={[toItem(primaryId, "primary"), toItem("move")]}
        more={moreIds.map((id) => toItem(id))}
        moreExtra={
          // TEMPORAL: pasan a bloques en las partes 2 y 3.
          <div className="flex flex-wrap gap-2">
            <AssetSheetButton
              codigo={asset.codigoInventario}
              label="Hoja de vida (PDF)"
              variant="primary"
            />
            <AssetImageButtons asset={asset}/>
          </div>
        }
      />

      {/* Zona de cuidado */}
      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-gray-700">
        <Button
          variant="danger-outline"
          disabled={Boolean(decommissionBlock)}
          onClick={() => setModal("decommission")}
        >
          <XCircle size={16} aria-hidden="true" />
          Dar de baja
        </Button>
        <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {decommissionBlock ??
            "Deja de contar en los totales; el historial se conserva."}
        </p>
      </div>

      <ChangeStatusModal
        asset={asset}
        open={modal === "status"}
        onClose={close}
      />
      <OpenMaintenanceModal
        asset={asset}
        open={modal === "open-maintenance"}
        onClose={close}
      />
      <CloseMaintenanceModal
        asset={asset}
        open={modal === "close-maintenance"}
        onClose={close}
      />
      <MoveModal asset={asset} open={modal === "move"} onClose={close} />
      <AssignModal asset={asset} open={modal === "assign"} onClose={close} />
      <ReturnAssignmentModal
        asset={asset}
        open={modal === "return"}
        onClose={close}
      />
      <EditAssetModal asset={asset} open={modal === "edit"} onClose={close} />

      <DecommissionModal
        asset={asset}
        open={modal === "decommission"}
        onClose={close}
        onDone={() => navigate("/admin/activos", { replace: true })}
      />
    </section>
  );
}
