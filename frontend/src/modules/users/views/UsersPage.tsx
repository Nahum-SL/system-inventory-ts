import { useState } from "react";
import { Users } from "lucide-react";

import Button from "@/shared/components/ui/Buttons/button";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
import { ErrorState } from "@/shared/components/ui/states/ErrorState";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";

import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";
import ResetPasswordModal from "../components/RessetPasswordModal";

import { useUsers } from "../hooks/use-users-queries";
import { UsersTable } from "../tables/users-table";
import type { UserAccount } from "../types";

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; user: UserAccount }
  | { kind: "password"; user: UserAccount }
  | null;

export default function UsersPage() {
  const { data, isPending, error, refetch } = useUsers();
  const [dialog, setDialog] = useState<Dialog>(null);

  const users = data ?? [];
  const close = () => setDialog(null);

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Usuarios
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra las cuentas, los roles y el acceso al sistema.
          </p>
        </div>

        <Button onClick={() => setDialog({ kind: "create" })}>
          Nuevo usuario
        </Button>
      </header>

      {/* Contenido */}
      {error ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <ErrorState
            title="No se pudieron cargar los usuarios"
            description="Comprueba tu conexión e inténtalo nuevamente."
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
      ) : isPending ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <LoadingState message="Cargando usuarios..." />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            icon={Users}
            title="No hay usuarios registrados"
            description="Crea una cuenta para comenzar a gestionar los accesos."
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cuentas registradas
            </p>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {users.length}
            </span>
          </div>

          <UsersTable
            users={users}
            onEdit={(user) => setDialog({ kind: "edit", user })}
            onResetPassword={(user) => setDialog({ kind: "password", user })}
          />
        </div>
      )}

      {/* Modales */}
      {dialog?.kind === "create" && <CreateUserModal open onClose={close} />}

      {dialog?.kind === "edit" && (
        <EditUserModal user={dialog.user} open onClose={close} />
      )}

      {dialog?.kind === "password" && (
        <ResetPasswordModal user={dialog.user} open onClose={close} />
      )}
    </section>
  );
}
