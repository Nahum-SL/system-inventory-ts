import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeftRight,
  ClipboardEdit,
  CirclePower,
  RotateCcw,
  UserRoundPlus,
  Wrench,
  XCircle,
} from "lucide-react";

import Button from "@/shared/components/ui/Buttons/button";
import { cn } from "@/shared/lib/utils";

import {
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

type ModalName =
  | "status"
  | "open-maintenance"
  | "close-maintenance"
  | "move"
  | "assign"
  | "return"
  | "decommission"
  | "edit"
  | null;

export default function AssetActions({ asset }: { asset: AssetCard }) {
  const [modal, setModal] = useState<ModalName>(null);
  const navigate = useNavigate();

  const close = () => setModal(null);

  const inMaintenance = asset.estado === "mantenimiento";
  const canAssign = asset.estado === "operativo" && !asset.asignacionActual;

  const actionButtonClass =
    "min-h-10 justify-center gap-2 rounded-xl px-3 sm:px-4";

  return (
    <section
      aria-labelledby="asset-actions-title"
      className={cn(
        "min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5",
        "border-slate-200 bg-white",
        "dark:border-gray-700 dark:bg-gray-900",
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <ClipboardEdit size={20} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h2
            id="asset-actions-title"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            Acciones de administrador
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestiona la asignación, ubicación y estado de este activo.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {asset.asignacionActual ? (
          <Button
            variant="secondary"
            className={actionButtonClass}
            onClick={() => setModal("return")}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Registrar devolución
          </Button>
        ) : (
          <Button
            variant="secondary"
            className={actionButtonClass}
            disabled={!canAssign}
            onClick={() => setModal("assign")}
          >
            <UserRoundPlus size={16} aria-hidden="true" />
            Asignar
          </Button>
        )}

        <Button
          variant="secondary"
          className={actionButtonClass}
          onClick={() => setModal("move")}
        >
          <ArrowLeftRight size={16} aria-hidden="true" />
          Trasladar
        </Button>

        <Button
          variant="secondary"
          className={actionButtonClass}
          disabled={inMaintenance}
          onClick={() => setModal("status")}
        >
          <CirclePower size={16} aria-hidden="true" />
          Cambiar estado
        </Button>

        {asset.mantenimientoAbierto ? (
          <Button
            variant="secondary"
            className={actionButtonClass}
            onClick={() => setModal("close-maintenance")}
          >
            <Wrench size={16} aria-hidden="true" />
            Cerrar mantenimiento
          </Button>
        ) : (
          <Button
            variant="secondary"
            className={actionButtonClass}
            onClick={() => setModal("open-maintenance")}
          >
            <Wrench size={16} aria-hidden="true" />
            Abrir mantenimiento
          </Button>
        )}

        <Button
          variant="secondary"
          className={actionButtonClass}
          onClick={() => setModal("edit")}
        >
          <ClipboardEdit size={16} aria-hidden="true" />
          Editar datos
        </Button>

        <Button
          variant="danger"
          className={actionButtonClass}
          onClick={() => setModal("decommission")}
        >
          <XCircle size={16} aria-hidden="true" />
          Dar de baja
        </Button>
      </div>

      {(inMaintenance || (!asset.asignacionActual && !canAssign)) && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-gray-800">
          {inMaintenance && (
            <p className="text-xs leading-5 text-amber-800 dark:text-amber-300">
              El cambio de estado está deshabilitado durante el mantenimiento.
              Para modificarlo, primero cierra el mantenimiento.
            </p>
          )}

          {!asset.asignacionActual && !canAssign && (
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Solo se pueden asignar activos que estén operativos.
            </p>
          )}
        </div>
      )}

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
