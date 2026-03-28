"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ProductStatusAccordion } from "@/components/ui/product-status-accordion";
import { Card } from "@/components/ui/card";
import { api, getStoredUser } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { DashboardData, InventoryRow, SessionUser, TransactionRecord } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

const initialData: DashboardData = { recentTransactions: [] };
const actionButtonClass = "flex h-14 items-center justify-center rounded-2xl border border-transparent px-3 text-center text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

function getTransactionTone(transactionType: TransactionRecord["type"]) {
  if (transactionType === "PURCHASE") return { label: "+ Buy", className: "bg-emerald-50 text-emerald-700" };
  if (transactionType === "USAGE") return { label: "- Sell", className: "bg-rose-50 text-rose-700" };
  return { label: transactionType, className: "bg-slate-100 text-slate-700" };
}

function getTransactionPartyTag(transaction: TransactionRecord) {
  if (transaction.type === "PURCHASE") {
    return { label: transaction.supplierName ? `From: ${transaction.supplierName}` : "From: Supplier", className: "bg-brand-50 text-brand-700" };
  }

  if (transaction.type === "USAGE") {
    return { label: transaction.customerName ? `To: ${transaction.customerName}` : "To: Customer", className: "bg-orange-50 text-orange-700" };
  }

  return { label: transaction.referenceNo, className: "bg-slate-100 text-slate-700" };
}

export default function DashboardPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData>(initialData);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
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

  const firstName = useMemo(() => {
    const displayName = user?.name?.trim() || "User";
    return displayName.split(" ")[0];
  }, [user]);

  const initials = useMemo(() => {
    const displayName = user?.name?.trim() || "U";
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  }, [user]);

  return (
    <div className="space-y-3">
      <Card className="bg-white/95">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">Hi, {firstName}</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">{t("dashboardTitle", language)}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("dashboardSubtitle", language)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <Bell size={18} />
              </button>
              <Link
                href="/settings"
                aria-label="Profile"
                className="group flex h-11 items-center gap-2 rounded-2xl border border-brand-200 bg-white pl-2 pr-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-violet-700 text-sm font-bold text-white shadow-sm ring-2 ring-white">
                  <span>{initials}</span>
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Profile</p>
                  <p className="text-sm font-semibold text-ink group-hover:text-brand-700">{firstName}</p>
                </div>
              </Link>
            </div>
            <LanguageToggle />
          </div>
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
        <div className="mt-3">
          <ProductStatusAccordion rows={inventory} language={language} onSaveLimit={saveLimit} />
        </div>
      </Card>

      <Card className="bg-white/95">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("quickActions", language)}</h2>
          <span className="text-xs font-semibold text-slate-400">Easy Tap</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/purchase" className={`${actionButtonClass} bg-brand-50 text-brand-700`}>{t("addPurchase", language)}</Link>
          <Link href="/usage" className={`${actionButtonClass} bg-orange-50 text-orange-700`}>{t("addUsage", language)}</Link>
          <Link href="/transactions" className={`${actionButtonClass} bg-slate-100 text-slate-800`}>{t("manageTransactions", language)}</Link>
          <Link href="/settings" className={`${actionButtonClass} bg-sky-50 text-sky-700`}>{t("myProfile", language)}</Link>
        </div>
      </Card>

      <Card className="bg-white/95">
        <h2 className="text-lg font-bold">{t("recentTransactions", language)}</h2>
        <div className="mt-3 space-y-3">
          {data.recentTransactions.map((transaction) => {
            const tone = getTransactionTone(transaction.type);
            const partyTag = getTransactionPartyTag(transaction);
            return (
              <div key={transaction.id} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{transaction.items[0]?.product.name ? `${transaction.items[0].product.name}${transaction.warehouseName ? ` (${transaction.warehouseName})` : ""}` : transaction.type}</p>
                    <p className="text-sm text-slate-500">Qty: {formatNumber(transaction.totalQuantity || 0)}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${partyTag.className}`}>{partyTag.label}</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

