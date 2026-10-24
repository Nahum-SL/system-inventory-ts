import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => number | string;
  onEdit?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  onEdit,
}: Props<T>) {
  if (rows.length === 0)
    return <p className="text-sm text-slate-500">Sin registros.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => (
              <th
                key={c.header}
                className={`px-3 py-2 font-semibold ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
            {onEdit && <th className="px-3 py-2" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.header} className={`px-3 py-2 ${c.className ?? ""}`}>
                  {c.cell(row)}
                </td>
              ))}
              {onEdit && (
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => onEdit(row)}
                    className="text-blue-700 underline"
                  >
                    Editar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
