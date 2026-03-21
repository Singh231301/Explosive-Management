"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { ProductStatusAccordion } from "@/components/ui/product-status-accordion";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { DashboardData, InventoryRow } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

const initialData: DashboardData = { recentTransactions: [] };

export default function DashboardPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData>(initialData);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);

  useEffect(() => {
    api.dashboard().then(setData).catch(() => undefined);
    api.inventory().then(setInventory).catch(() => undefined);
  }, []);

  async function saveLimit(productId: string, maxLimit: number | null, lowLimit: number | null) {
    try {
      await api.setInventoryLimit(productId, { maxLimit, lowLimit });
      const refreshed = await api.inventory();
      setInventory(refreshed);
      showToast("Product limit updated", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update limit", "error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={t("dashboardTitle", language)} subtitle={t("dashboardSubtitle", language)} />
        <LanguageToggle />
      </div>

      <Card className="bg-white/95">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("quickActions", language)}</h2>
          <span className="text-xs font-semibold text-slate-400">Easy Tap</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
          <Link href="/purchase" className="rounded-3xl bg-brand-50 px-4 py-5 text-center text-brand-700 shadow-sm transition hover:-translate-y-0.5">{t("addPurchase", language)}</Link>
          <Link href="/usage" className="rounded-3xl bg-orange-50 px-4 py-5 text-center text-orange-700 shadow-sm transition hover:-translate-y-0.5">{t("addUsage", language)}</Link>
          <Link href="/transactions" className="rounded-3xl bg-slate-100 px-4 py-5 text-center text-slate-800 shadow-sm transition hover:-translate-y-0.5">{t("manageTransactions", language)}</Link>
          <Link href="/settings" className="rounded-3xl bg-sky-50 px-4 py-5 text-center text-sky-700 shadow-sm transition hover:-translate-y-0.5">{t("myProfile", language)}</Link>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t("stockInMagazine", language)}</h2>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">{inventory.length} items</span>
        </div>
        <ProductStatusAccordion rows={inventory} language={language} onSaveLimit={saveLimit} />
      </div>

      <Card className="bg-white/95">
        <h2 className="text-lg font-bold">{t("recentTransactions", language)}</h2>
        <div className="mt-3 space-y-3">
          {data.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="rounded-2xl border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{transaction.items[0]?.product.name || transaction.type}</p>
                  <p className="text-sm text-slate-500">Qty: {formatNumber(transaction.totalQuantity || 0)}</p>
                </div>
                <span className="text-xs font-semibold text-brand-600">{transaction.type}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatDate(transaction.createdAt)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
