"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { InventoryRow } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export default function InventoryPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.inventory()
      .then((result) => {
        setRows(result);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("unableToLoad", language)))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div className="space-y-4">
      <PageHeader title={t("inventoryTitle", language)} subtitle={t("inventorySubtitle", language)} />
      {loading ? <Card className="bg-white/95 text-center text-slate-500">{t("loading", language)}</Card> : null}
      {error ? <Card className="bg-white/95 text-center text-danger">{error}</Card> : null}
      {!loading && !error && !rows.length ? <Card className="bg-white/95 text-center text-slate-500">{t("noStockFound", language)}</Card> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id} className="bg-white/95">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold">{row.productName}</p>
                <p className="text-sm text-slate-500">{row.warehouseName}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${row.isLowStock ? "text-warning" : "text-brand-700"}`}>{formatNumber(row.quantity)}</p>
                <p className="text-sm text-slate-500">{row.unit}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">{t("updated", language)} {formatDate(row.updatedAt)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
