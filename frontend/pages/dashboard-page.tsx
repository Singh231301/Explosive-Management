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
const actionCardClass = "flex h-20 flex-col justify-center rounded-2xl border border-transparent px-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

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
          <Link href="/purchase" className={`${actionCardClass} bg-brand-50 text-brand-700`}><span>{t("addPurchase", language)}</span></Link>
          <Link href="/usage" className={`${actionCardClass} bg-orange-50 text-orange-700`}><span>{t("addUsage", language)}</span></Link>
          <Link href="/transactions" className={`${actionCardClass} bg-slate-100 text-slate-800`}><span>{t("manageTransactions", language)}</span></Link>
          <Link href="/settings" className={`${actionCardClass} bg-sky-50 text-sky-700`}><span>{t("myProfile", language)}</span></Link>
        </div>
      </Card>

      <Card className="bg-white/95">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">{t("stockInMagazine", language)}</h2>
            <p className="mt-1 text-sm text-slate-500">Tap any stock tile to set min and max limits.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{inventory.length} items</span>
        </div>
        <div className="mt-4">
          <ProductStatusAccordion rows={inventory} language={language} onSaveLimit={saveLimit} />
        </div>
      </Card>

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

