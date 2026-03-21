import { Card } from "@/components/ui/card";

type Column<T> = { key: keyof T; label: string };

export function SimpleTable<T extends Record<string, string | number>>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  return (
    <Card className="overflow-hidden bg-white/95 p-0">
      <div className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-1 px-4 py-3">
            {columns.map((column) => (
              <div key={String(column.key)} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">{column.label}</span>
                <span className="font-semibold text-ink">{String(row[column.key])}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
