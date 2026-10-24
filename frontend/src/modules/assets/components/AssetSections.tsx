import { useState } from "react";
import Button from "@/shared/components/ui/Buttons/button";
import { ChangeStatusModal, type AssetCard } from "@/modules/assets";

type ModalName = "status" | null;

export default function AssetActions({ asset }: { asset: AssetCard }) {
  const [modal, setModal] = useState<ModalName>(null);
  const inMaintenance = asset.estado === "mantenimiento";

  return (
    <section className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-800">
        Acciones de administrador
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          disabled={inMaintenance}
          onClick={() => setModal("status")}
        >
          Cambiar estado
        </Button>
        {inMaintenance && (
          <span className="text-xs text-blue-900">
            En mantenimiento: cierra el mantenimiento para cambiar el estado.
          </span>
        )}
      </div>

      <ChangeStatusModal
        asset={asset}
        open={modal === "status"}
        onClose={() => setModal(null)}
      />
    </section>
  );
}
