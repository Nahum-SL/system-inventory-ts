import { KeyRound, Pencil } from "lucide-react";

import { TableButton } from "@/shared/components/ui/tables/TableButton";
import { TableCell } from "@/shared/components/ui/tables/TableCell";
import { TableRow } from "@/shared/components/ui/tables/TableRow";

import type { UserAccount } from "../types";

interface Props {
  user: UserAccount;
  onEdit: (user: UserAccount) => void;
  onResetPassword: (user: UserAccount) => void;
}

export function UsersRow({ user, onEdit, onResetPassword }: Props) {
  const fullName = [user.nombres, user.apellidos].filter(Boolean).join(" ");

  return (
    <TableRow>
      {/* Identidad */}
      <TableCell>
        <div className="min-w-40 space-y-1">
          <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
            {user.username}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {fullName || "Sin nombre registrado"}
          </p>
        </div>
      </TableCell>

      {/* Rol */}
      <TableCell>
        <span
          className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${
            user.rol === "admin"
              ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300"
              : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {user.rol === "admin" ? "Administrador" : "Usuario"}
        </span>
      </TableCell>

      {/* Estado */}
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            user.activo
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              user.activo ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {user.activo ? "Activa" : "Desactivada"}
        </span>
      </TableCell>

      {/* Acciones */}
      <TableCell align="right">
        <div className="flex items-center justify-end gap-2">
          <TableButton title="Editar rol y estado" onClick={() => onEdit(user)}>
            <Pencil size={16} />
          </TableButton>

          <TableButton
            title="Restablecer contraseña"
            onClick={() => onResetPassword(user)}
          >
            <KeyRound size={16} />
          </TableButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
