import { useState } from "react";
import { useNavigate } from "react-router";
// Componente Atomico
import Button from "@/shared/components/ui/Buttons/button";
// MODALS - ASSET / ACTIVOS
import {
  AssignModal,
  ChangeStatusModal,
  CloseMaintenanceModal,
  DecommissionModal,
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
  | null;

export default function AssetActions({ asset }: { asset: AssetCard }) {
  const [modal, setModal] = useState<ModalName>(null);
  const navigate = useNavigate();
  const close = () => setModal(null);

  const inMaintenance = asset.estado === "mantenimiento";
  const canAssign = asset.estado === "operativo" && !asset.asignacionActual;

  console.log({ estado: asset.estado, asignacion: asset.asignacionActual, modal });

  return (
    <section className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-800">
        Acciones de administrador
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        {asset.asignacionActual ? (
          <Button variant="secondary" onClick={() => setModal("return")}>
            Registrar devolución
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled={!canAssign}
            onClick={() => setModal("assign")}
          >
            Asignar
          </Button>
        )}

        <Button variant="secondary" onClick={() => setModal("move")}>
          Trasladar
        </Button>

        <Button
          variant="secondary"
          disabled={inMaintenance}
          onClick={() => setModal("status")}
        >
          Cambiar estado
        </Button>

        {asset.mantenimientoAbierto ? (
          <Button
            variant="secondary"
            onClick={() => setModal("close-maintenance")}
          >
            Cerrar mantenimiento
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setModal("open-maintenance")}
          >
            Abrir mantenimiento
          </Button>
        )}

        <Button variant="danger" onClick={() => setModal("decommission")}>
          Dar de baja
        </Button>
      </div>

      {!asset.asignacionActual && !canAssign && (
        <p className="text-xs text-blue-900">
          Solo se asignan activos operativos.
        </p>
      )}
      {inMaintenance && (
        <p className="text-xs text-blue-900">
          En mantenimiento: ciérralo para cambiar el estado o dar de baja.
        </p>
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
      <DecommissionModal
        asset={asset}
        open={modal === "decommission"}
        onClose={close}
        onDone={() => navigate("/admin/activos", { replace: true })}
      />
    </section>
  );
}
