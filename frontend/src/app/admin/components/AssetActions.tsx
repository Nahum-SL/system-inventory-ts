
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
  QrCode,
  History,
  Zap,
  type LucideIcon,
} from "lucide-react";

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

import AssetQr from "@/modules/assets/components/AssetQr";
import HistorySection from "@/modules/assets/components/HistorySection";

import AssignPersonPicker, {
  type AssignablePerson,
} from "@/modules/assets/components/actions/AssignPersonPicker";

type ActionId =
  | "status"
  | "open-maintenance"
  | "close-maintenance"
  | "move"
  | "assign"
  | "return"
  | "edit";

type ModalName = ActionId | "decommission" | null;

type TabId = "assign" | "quick" | "qr" | "history";

interface ActionDef {
  id: ActionId;
  label: string;
  Icon: LucideIcon;
  disabledReason?: string;
}

const tabs: {
  id: TabId;
  label: string;
  Icon: LucideIcon;
}[] = [
  {
    id: "assign",
    label: "Asignar",
    Icon: UserRoundPlus,
  },
  {
    id: "quick",
    label: "Opciones rápidas",
    Icon: Zap,
  },
  {
    id: "qr",
    label: "QR",
    Icon: QrCode,
  },
  {
    id: "history",
    label: "Historial",
    Icon: History,
  },
];

export default function AssetActions({
  asset,
}: {
  asset: AssetCard;
}) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<TabId>("assign");

  const [modal, setModal] =
    useState<ModalName>(null);

  const [selectedPerson, setSelectedPerson] =
    useState<AssignablePerson | null>(null);

  const assigned = Boolean(asset.asignacionActual);

  const inMaintenance =
    asset.estado === "mantenimiento";

  const hasOpenMaintenance =
    Boolean(asset.mantenimientoAbierto);

  const canAssign =
    asset.estado === "operativo" && !assigned;

  const close = () => {
    setModal(null);
  };

  const closeAssign = () => {
    setModal(null);
    setSelectedPerson(null);
  };

  const selectPerson = (person: AssignablePerson) => {
    if (!canAssign) return;

    setSelectedPerson(person);
    setModal("assign");
  };

  const showHistory = () => {
    closeAssign();
    setActiveTab("history");
  };

  const quickActions: ActionDef[] = [
    {
      id: "move",
      label: "Trasladar",
      Icon: ArrowLeftRight,
    },
    hasOpenMaintenance
      ? {
          id: "close-maintenance",
          label: "Cerrar mantenimiento",
          Icon: Wrench,
        }
      : {
          id: "open-maintenance",
          label: "Abrir mantenimiento",
          Icon: Wrench,
        },
    {
      id: "status",
      label: "Cambiar estado",
      Icon: CirclePower,
      disabledReason: inMaintenance
        ? "Cierra el mantenimiento antes de cambiar el estado."
        : undefined,
    },
    {
      id: "edit",
      label: "Editar datos",
      Icon: ClipboardEdit,
    },
  ];

  const decommissionBlock =
    inMaintenance || hasOpenMaintenance
      ? "Primero cierra el mantenimiento."
      : assigned
        ? "Primero registra la devolución."
        : undefined;

  const renderAction = ({
    id,
    label,
    Icon,
    disabledReason,
  }: ActionDef) => (
    <button
      key={id}
      type="button"
      disabled={Boolean(disabledReason)}
      title={disabledReason}
      onClick={() => setModal(id)}
      className="
        group flex min-h-16 items-center gap-3
        rounded-xl border border-slate-200
        bg-white px-4 py-3 text-left
        text-sm font-medium text-slate-700
        transition-colors
        hover:border-indigo-400 hover:bg-indigo-50
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-indigo-500
        disabled:cursor-not-allowed
        disabled:opacity-40
        dark:border-[#34415f]
        dark:bg-[#202b45]
        dark:text-slate-200
        dark:hover:border-indigo-500
        dark:hover:bg-[#293756]
      "
    >
      <span
        className="
          flex size-10 shrink-0 items-center
          justify-center rounded-xl
          bg-indigo-500/10
          text-indigo-600
          dark:text-indigo-400
        "
      >
        <Icon size={19} aria-hidden="true" />
      </span>

      <span>{label}</span>
    </button>
  );

  return (
    <section className="w-full min-w-0">
      {/* PESTAÑAS PRINCIPALES */}
      <div
        role="tablist"
        aria-label="Gestión del activo"
        className="
          flex gap-1 overflow-x-auto
          border-b border-slate-200
          dark:border-[#34415f]
        "
      >
        {tabs.map(({ id, label, Icon }) => {
          const selected = activeTab === id;

          return (
            <button
              key={id}
              id={`asset-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`asset-panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={`
                flex min-h-14 flex-1 shrink-0
                items-center justify-center gap-2
                whitespace-nowrap border-b-2
                px-4 py-3 text-sm font-medium
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-indigo-500
                ${
                  selected
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-300"
                    : "border-transparent text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-slate-200"
                }
              `}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {/* PESTAÑA ASIGNAR */}
      {activeTab === "assign" && (
        <div
          id="asset-panel-assign"
          role="tabpanel"
          aria-labelledby="asset-tab-assign"
          className="px-2 py-6 sm:px-4"
        >
          {canAssign ? (
            <AssignPersonPicker
              onSelect={selectPerson}
            />
          ) : (
            <div
              className="
                rounded-2xl border border-slate-200
                bg-white p-6
                dark:border-[#34415f]
                dark:bg-[#172137]
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex size-12 shrink-0
                    items-center justify-center
                    rounded-xl bg-indigo-500/10
                    text-indigo-500
                  "
                >
                  <RotateCcw size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    className="
                      text-lg font-semibold
                      text-slate-900 dark:text-white
                    "
                  >
                    {assigned
                      ? "Activo actualmente asignado"
                      : "Asignación no disponible"}
                  </h2>

                  <p
                    className="
                      mt-2 text-sm
                      text-slate-500 dark:text-slate-400
                    "
                  >
                    {assigned
                      ? `Responsable actual: ${
                          asset.asignacionActual
                            ?.personaNombre ??
                          "No disponible"
                        }`
                      : "El activo debe estar operativo para poder asignarlo."}
                  </p>

                  {assigned && (
                    <button
                      type="button"
                      onClick={() =>
                        setModal("return")
                      }
                      className="
                        mt-5 inline-flex min-h-11
                        items-center gap-2 rounded-xl
                        bg-indigo-600 px-5
                        text-sm font-semibold text-white
                        transition-colors
                        hover:bg-indigo-500
                      "
                    >
                      <RotateCcw size={17} />
                      Registrar devolución
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA OPCIONES RÁPIDAS */}
      {activeTab === "quick" && (
        <div
          id="asset-panel-quick"
          role="tabpanel"
          aria-labelledby="asset-tab-quick"
          className="space-y-5 px-2 py-6 sm:px-4"
        >
          <div>
            <h2
              className="
                text-base font-semibold
                text-slate-900 dark:text-white
              "
            >
              Opciones rápidas
            </h2>

            <p
              className="
                mt-1 text-sm
                text-slate-500 dark:text-slate-400
              "
            >
              Administra las operaciones del activo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(renderAction)}
          </div>

          <div
            className="
              flex flex-wrap items-center gap-3
              border-t border-slate-200 pt-4
              dark:border-[#34415f]
            "
          >
            <AssetImageButtons asset={asset} />

            <button
              type="button"
              disabled={Boolean(decommissionBlock)}
              title={decommissionBlock}
              onClick={() =>
                setModal("decommission")
              }
              className="
                inline-flex min-h-10 items-center
                gap-2 rounded-xl border
                border-red-500/40 px-4
                text-sm font-medium text-red-500
                transition-colors
                hover:bg-red-500/10
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <XCircle size={17} />
              Dar de baja
            </button>
          </div>

          {decommissionBlock && (
            <p className="text-xs text-amber-500">
              {decommissionBlock}
            </p>
          )}
        </div>
      )}

      {/* PESTAÑA QR */}
      {activeTab === "qr" && (
        <div
          id="asset-panel-qr"
          role="tabpanel"
          aria-labelledby="asset-tab-qr"
          className="py-6"
        >
          <AssetQr
            id={asset.id}
            codigo={asset.codigoInventario}
          />
        </div>
      )}

      {/* PESTAÑA HISTORIAL */}
      {activeTab === "history" && (
        <div
          id="asset-panel-history"
          role="tabpanel"
          aria-labelledby="asset-tab-history"
          className="py-6"
        >
          <HistorySection assetId={asset.id} />
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN */}
      <AssignModal
        asset={asset}
        open={modal === "assign"}
        onClose={closeAssign}
        selectedPerson={selectedPerson}
        onViewHistory={showHistory}
      />

      {/* MODALES EXISTENTES */}
      <ReturnAssignmentModal
        asset={asset}
        open={modal === "return"}
        onClose={close}
      />

      <MoveModal
        asset={asset}
        open={modal === "move"}
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

      <ChangeStatusModal
        asset={asset}
        open={modal === "status"}
        onClose={close}
      />

      <EditAssetModal
        asset={asset}
        open={modal === "edit"}
        onClose={close}
      />

      <DecommissionModal
        asset={asset}
        open={modal === "decommission"}
        onClose={close}
        onDone={() =>
          navigate("/admin/activos", {
            replace: true,
          })
        }
      />
    </section>
  );
}
