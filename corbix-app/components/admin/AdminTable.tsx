import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

type AdminTableProps<T> = {
  columns: Array<Column<T>>;
  rows: T[];
};

export function AdminTable<T extends { id?: string }>({
  columns,
  rows,
}: AdminTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-surface">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 text-muted">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={(row.id ?? index).toString()} className="border-t border-white/10">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3 text-white">
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[String(column.key)] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
