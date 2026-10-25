import { Table } from "@/shared/components/ui/tables/Table";

import { UsersRow } from "./users-row";
import type { UserAccount } from "../types";

const HEADERS = ["Usuario", "Rol", "Estado", "Acciones"];

interface Props {
  users: UserAccount[];
  onEdit: (user: UserAccount) => void;
  onResetPassword: (user: UserAccount) => void;
}

export function UsersTable({ users, onEdit, onResetPassword }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <Table headers={HEADERS} isLoading={false} isEmpty={false}>
          {users.map((user) => (
            <UsersRow
              key={user.id}
              user={user}
              onEdit={onEdit}
              onResetPassword={onResetPassword}
            />
          ))}
        </Table>
      </div>
    </div>
  );
}
