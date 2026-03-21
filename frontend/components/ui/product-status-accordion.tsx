"use client";

import { TriangleAlert, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, type Language } from "@/lib/i18n";
import type { InventoryRow } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function ProductStatusAccordion({ rows, language, onSaveLimit }: { rows: InventoryRow[]; language: Language; onSaveLimit: (productId: string, maxLimit: number | null, lowLimit: number | null) => Promise<void>; }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [maxLimit, setMaxLimit] = useState("");
  const [lowLimit, setLowLimit] = useState("");

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const isEditing = editingId === row.productId;
        return (
          <Card key={row.id} className={`bg-white/95 ${row.isOverLimit ? "border-rose-300" : row.isLowStock ? "border-amber-300" : "border-white/70"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-ink">{row.productName}</p>
                  {row.isLowStock ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">Low</span> : null}
                  {row.isOverLimit ? <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">Over</span> : null}
                </div>
                <p className="text-sm text-slate-500">{row.warehouseName}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${row.isOverLimit ? "text-rose-600" : row.isLowStock ? "text-amber-600" : "text-brand-700"}`}>{formatNumber(row.quantity)}</p>
                <p className="text-xs text-slate-500">{row.unit}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-500">Low limit</p>
                <p className="mt-1 font-semibold text-ink">{formatNumber(row.lowLimit)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-500">Max limit</p>
                <p className="mt-1 font-semibold text-ink">{row.maxLimit === null ? "Not set" : formatNumber(row.maxLimit)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              {row.isLowStock ? <TriangleAlert size={14} className="text-amber-600" /> : <TrendingUp size={14} className="text-emerald-600" />}
              <span>{t("updated", language)} {formatDate(row.updatedAt)}</span>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-3">
                <Input type="number" step="0.001" value={lowLimit} onChange={(event) => setLowLimit(event.target.value)} placeholder="Low limit" />
                <Input type="number" step="0.001" value={maxLimit} onChange={(event) => setMaxLimit(event.target.value)} placeholder="Max limit" />
                <div className="flex gap-2">
                  <Button type="button" className="w-auto bg-brand-600 px-3 py-2" onClick={async () => { await onSaveLimit(row.productId, maxLimit ? Number(maxLimit) : null, lowLimit ? Number(lowLimit) : null); setEditingId(null); }}>{t("saveChanges", language)}</Button>
                  <Button type="button" className="w-auto bg-slate-700 px-3 py-2" onClick={() => setEditingId(null)}>{t("cancel", language)}</Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <Button type="button" className="w-auto bg-slate-900 px-3 py-2" onClick={() => { setEditingId(row.productId); setLowLimit(String(row.lowLimit)); setMaxLimit(row.maxLimit === null ? "" : String(row.maxLimit)); }}>{t("edit", language)}</Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
