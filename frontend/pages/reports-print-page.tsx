"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { BillingReport, TransactionRecord } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const initialBilling: BillingReport = {
  filters: { range: "this_month", startDate: "", endDate: "", label: "This Month", partyType: "all", partyName: "All Parties" },
  summary: { totalTransactions: 0, totalQuantity: 0, totalDebit: 0, totalCredit: 0, netAmount: 0 },
  transactions: []
};

function getTransactionTone(transactionType: TransactionRecord["type"]) {
  if (transactionType === "PURCHASE") return { label: "+ Buy", className: "bg-emerald-50 text-emerald-700" };
  if (transactionType === "USAGE") return { label: "- Sell", className: "bg-rose-50 text-rose-700" };
  return { label: transactionType, className: "bg-slate-100 text-slate-700" };
}

function getPartyLabel(transaction: TransactionRecord) {
  if (transaction.type === "PURCHASE") return transaction.supplierName ? `From: ${transaction.supplierName}` : "From: Supplier";
  if (transaction.type === "USAGE") return transaction.customerName ? `To: ${transaction.customerName}` : "To: Customer";
  return transaction.referenceNo;
}

export default function PrintReportPage() {
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingReport>(initialBilling);

  useEffect(() => {
    const params = searchParams;
    api.billingReport({
      range: params?.get("range") || "this_month",
      startDate: params?.get("startDate") || "",
      endDate: params?.get("endDate") || "",
      partyType: params?.get("partyType") || "all",
      partyId: params?.get("partyId") || ""
    }).then(setBilling).catch(() => undefined);
  }, [searchParams]);

  return (
    <div className="space-y-4 bg-white text-black">
      <PageHeader title="Professional Billing Statement" subtitle="Use browser print and save as PDF" />
      <div className="flex justify-end">
        <Button type="button" className="w-auto bg-slate-900 hover:bg-slate-800 print:hidden" onClick={() => window.print()}>Print Statement</Button>
      </div>

      <Card className="bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Explosive Manager</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Transaction Statement</h2>
            <p className="mt-1 text-sm text-slate-500">{billing.filters.label}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p><span className="font-semibold">Statement For:</span> {billing.filters.partyName}</p>
            <p><span className="font-semibold">From:</span> {billing.filters.startDate ? formatDate(billing.filters.startDate) : "-"}</p>
            <p><span className="font-semibold">To:</span> {billing.filters.endDate ? formatDate(billing.filters.endDate) : "-"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Transactions</p><p className="mt-1 text-lg font-bold text-ink">{formatNumber(billing.summary.totalTransactions)}</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Total Qty</p><p className="mt-1 text-lg font-bold text-ink">{formatNumber(billing.summary.totalQuantity)}</p></div>
          <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Total Buy</p><p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(billing.summary.totalDebit)}</p></div>
          <div className="rounded-2xl bg-rose-50 p-3"><p className="text-xs text-rose-700">Total Sell</p><p className="mt-1 text-lg font-bold text-rose-700">{formatCurrency(billing.summary.totalCredit)}</p></div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          {billing.transactions.map((transaction) => {
            const tone = getTransactionTone(transaction.type);
            return (
              <div key={transaction.id} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{transaction.referenceNo}</p>
                    <p className="mt-1 text-slate-600">{getPartyLabel(transaction)}</p>
                    <p className="mt-1 text-xs text-slate-500">Updated {formatDate(transaction.updatedAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
                    <p className="mt-2 font-semibold text-ink">{formatCurrency(transaction.totalAmount || 0)}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {transaction.items.map((item) => {
                    const unitPrice = Number(item.pricePerUnit || 0);
                    const itemAmount = Number(item.quantity || 0) * unitPrice;
                    return (
                      <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                          <span>{item.product.name}</span>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Qty {formatNumber(item.quantity)} x {formatNumber(unitPrice)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!billing.transactions.length ? <p className="text-sm text-slate-500">No transactions found for this statement.</p> : null}
        </div>
      </Card>
    </div>
  );
}


