"use client";

import { Minus, SlidersHorizontal, TriangleAlert, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t, type Language } from "@/lib/i18n";
import type { InventoryRow } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function ProductStatusAccordion({ rows, language, onSaveLimit, canEdit = true }: { rows: InventoryRow[]; language: Language; onSaveLimit: (productId: string, maxLimit: number | null, lowLimit: number | null) => Promise<void>; canEdit?: boolean; }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [maxLimit, setMaxLimit] = useState("");
  const [lowLimit, setLowLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const activeRow = useMemo(() => rows.find((row) => row.productId === activeId) ?? null, [activeId, rows]);

  function openEditor(row: InventoryRow) {
    if (!canEdit) return;

    if (activeId === row.productId) {
      setActiveId(null);
      return;
    }

    setActiveId(row.productId);
    setLowLimit(String(row.lowLimit));
    setMaxLimit(row.maxLimit === null ? "" : String(row.maxLimit));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {rows.map((row) => {
          const isActive = activeId === row.productId;
          const toneClass = row.isOverLimit
            ? "border-rose-300 bg-rose-50/95 text-rose-700 shadow-rose-100"
            : row.isLowStock
              ? "border-amber-300 bg-amber-50/95 text-amber-700 shadow-amber-100"
              : "border-emerald-200 bg-emerald-50/90 text-emerald-700 shadow-emerald-100";
          const dotClass = row.isOverLimit ? "bg-rose-500" : row.isLowStock ? "bg-amber-500" : "bg-emerald-500";
          const quantityClass = row.isOverLimit ? "text-rose-700" : row.isLowStock ? "text-amber-700" : "text-emerald-700";

          return (
            <button
              key={row.id}
              type="button"
              onClick={() => openEditor(row)}
              className={`rounded-[28px] border p-4 text-left shadow-sm transition ${toneClass} ${isActive ? "ring-2 ring-slate-900/15" : canEdit ? "hover:-translate-y-0.5" : "cursor-default"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                    <p className="truncate text-sm font-semibold text-ink">{row.productName}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{row.warehouseName}</p>
                </div>
                {canEdit ? <SlidersHorizontal size={16} className={isActive ? "text-slate-700" : "text-slate-400"} /> : null}
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className={`text-2xl font-bold ${quantityClass}`}>{formatNumber(row.quantity)}</p>
                  <p className="text-xs text-slate-500">{row.unit}</p>
                </div>
                <div className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {formatNumber(row.lowLimit)} / {row.maxLimit === null ? "--" : formatNumber(row.maxLimit)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeRow && canEdit ? (
        <Card className={`border ${activeRow.isOverLimit ? "border-rose-200 bg-white/95" : activeRow.isLowStock ? "border-amber-200 bg-white/95" : "border-emerald-200 bg-white/95"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {activeRow.isOverLimit ? (
                  <TriangleAlert size={16} className="text-rose-600" />
                ) : activeRow.isLowStock ? (
                  <TriangleAlert size={16} className="text-amber-600" />
                ) : (
                  <TrendingUp size={16} className="text-emerald-600" />
                )}
                <p className="text-lg font-bold text-ink">{activeRow.productName}</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{activeRow.warehouseName}</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${activeRow.isOverLimit ? "text-rose-600" : activeRow.isLowStock ? "text-amber-600" : "text-emerald-600"}`}>{formatNumber(activeRow.quantity)}</p>
              <p className="text-xs text-slate-500">{activeRow.unit}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-slate-500">Low limit</p>
              <p className="mt-1 font-semibold text-ink">{formatNumber(activeRow.lowLimit)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-slate-500">Max limit</p>
              <p className="mt-1 font-semibold text-ink">{activeRow.maxLimit === null ? "Not set" : formatNumber(activeRow.maxLimit)}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Minus size={14} className="text-slate-400" />
            <span>{t("updated", language)} {formatDate(activeRow.updatedAt)}</span>
          </div>

          <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-3">
            <Input type="number" step="0.001" value={lowLimit} onChange={(event) => setLowLimit(event.target.value)} placeholder="Low limit" />
            <Input type="number" step="0.001" value={maxLimit} onChange={(event) => setMaxLimit(event.target.value)} placeholder="Max limit" />
            <div className="flex gap-2">
              <Button
                type="button"
                className="w-auto min-w-0 bg-brand-600"
                loading={saving}
                loadingText="Saving..."
                onClick={async () => {
                  setSaving(true);
                  try {
                    await onSaveLimit(activeRow.productId, maxLimit ? Number(maxLimit) : null, lowLimit ? Number(lowLimit) : null);
                    setActiveId(null);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {t("saveChanges", language)}
              </Button>
              <Button type="button" className="w-auto min-w-0 bg-slate-700 hover:bg-slate-800" onClick={() => setActiveId(null)} disabled={saving}>
                {t("cancel", language)}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
