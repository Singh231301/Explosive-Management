"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/layout/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { api, getToken } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { BillingReport, Party, TransactionRecord } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const initialBilling: BillingReport = {
  filters: { range: "this_month", startDate: "", endDate: "", label: "This Month", partyType: "all", partyName: "All Parties" },
  summary: { totalTransactions: 0, totalQuantity: 0, totalDebit: 0, totalCredit: 0, netAmount: 0 },
  transactions: []
};

async function downloadProtected(path: string, filename: string) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

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

function buildPdfQuery(filters: { range: string; startDate: string; endDate: string; partyType: string; partyId: string }) {
  const search = new URLSearchParams();
  if (filters.range) search.set("range", filters.range);
  if (filters.startDate) search.set("startDate", filters.startDate);
  if (filters.endDate) search.set("endDate", filters.endDate);
  if (filters.partyType) search.set("partyType", filters.partyType);
  if (filters.partyId) search.set("partyId", filters.partyId);
  return `/reports/pdf?${search.toString()}`;
}

function buildPdfDownloadPath(filters: { range: string; startDate: string; endDate: string; partyType: string; partyId: string }) {
  const search = new URLSearchParams();
  if (filters.range) search.set("range", filters.range);
  if (filters.startDate) search.set("startDate", filters.startDate);
  if (filters.endDate) search.set("endDate", filters.endDate);
  if (filters.partyType) search.set("partyType", filters.partyType);
  if (filters.partyId) search.set("partyId", filters.partyId);
  search.set("download", "1");
  return `/reports/billing/pdf?${search.toString()}`;
}

function shouldAutoGenerate(filters: { range: string; startDate: string; endDate: string; partyType: string; partyId: string }) {
  if (filters.range === "custom" && (!filters.startDate || !filters.endDate)) return false;
  if (filters.partyType !== "all" && !filters.partyId) return false;
  return true;
}

export default function ReportsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const [billing, setBilling] = useState<BillingReport>(initialBilling);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [customers, setCustomers] = useState<Party[]>([]);
  const [message, setMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [filters, setFilters] = useState({ range: "this_month", startDate: "", endDate: "", partyType: "all", partyId: "" });

  useEffect(() => {
    Promise.all([api.suppliers(), api.customers()])
      .then(([supplierRows, customerRows]) => {
        setSuppliers(supplierRows);
        setCustomers(customerRows);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!shouldAutoGenerate(filters)) return;
    void generateBillingReport(filters);
  }, [filters]);

  async function runDownload(key: string, path: string, filename: string) {
    try {
      setLoadingKey(key);
      setMessage("");
      await downloadProtected(path, filename);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Download failed");
    } finally {
      setLoadingKey(null);
    }
  }

  async function generateBillingReport(nextFilters: typeof filters) {
    try {
      setBillingLoading(true);
      setMessage("");
      const report = await api.billingReport(nextFilters);
      setBilling(report);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load billing report");
    } finally {
      setBillingLoading(false);
    }
  }

  const partyOptions = useMemo(() => {
    if (filters.partyType === "supplier") return suppliers.map((row) => ({ label: row.name, value: row.id }));
    if (filters.partyType === "customer") return customers.map((row) => ({ label: row.name, value: row.id }));
    return [];
  }, [customers, filters.partyType, suppliers]);

  const pdfPreviewUrl = buildPdfQuery(filters);
  const pdfDownloadPath = buildPdfDownloadPath(filters);
  const waitingForSelection = !shouldAutoGenerate(filters);

  return (
    <div className="space-y-4">
      <PageHeader title={t("reportsTitle", language)} subtitle={t("reportsSubtitle", language)} />

      <Card className="bg-white/95">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Billing Statement</h2>
          {billingLoading ? <span className="text-xs font-semibold text-brand-500">Updating...</span> : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Dropdown
            label="Date Range"
            options={[
              { label: "This Month", value: "this_month" },
              { label: "Last Week", value: "last_week" },
              { label: "Last Month", value: "last_month" },
              { label: "Last Year", value: "last_year" },
              { label: "Custom Range", value: "custom" }
            ]}
            value={filters.range}
            onChange={(value) => setFilters((current) => ({ ...current, range: value }))}
          />
          <Dropdown
            label="Statement For"
            options={[
              { label: "All Transactions", value: "all" },
              { label: "Specific Supplier", value: "supplier" },
              { label: "Specific Customer", value: "customer" }
            ]}
            value={filters.partyType}
            onChange={(value) => setFilters((current) => ({ ...current, partyType: value, partyId: "" }))}
          />
          {filters.range === "custom" ? <Input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} /> : null}
          {filters.range === "custom" ? <Input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} /> : null}
          {filters.partyType !== "all" ? (
            <Dropdown
              label={filters.partyType === "supplier" ? "Supplier" : "Customer"}
              options={partyOptions}
              value={filters.partyId}
              onChange={(value) => setFilters((current) => ({ ...current, partyId: value }))}
              searchPlaceholder={filters.partyType === "supplier" ? "Select supplier" : "Select customer"}
            />
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={pdfPreviewUrl} className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md">
            Preview PDF
          </Link>
          <Button type="button" className="w-auto bg-brand-600" loading={loadingKey === "statement-pdf"} loadingText="Preparing..." onClick={() => runDownload("statement-pdf", pdfDownloadPath, "billing-statement.pdf")}>Download PDF</Button>
          <Button type="button" className="w-auto bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900" onClick={() => setFilters({ range: "this_month", startDate: "", endDate: "", partyType: "all", partyId: "" })}>Reset</Button>
        </div>

        {waitingForSelection ? <p className="mt-3 text-sm text-slate-500">Select the remaining filter to update the bill.</p> : null}
        {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Total Entries</p><p className="mt-1 text-lg font-bold text-ink">{formatNumber(billing.summary.totalTransactions)}</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Total Qty</p><p className="mt-1 text-lg font-bold text-ink">{formatNumber(billing.summary.totalQuantity)}</p></div>
          <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Total Buy</p><p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(billing.summary.totalDebit)}</p></div>
          <div className="rounded-2xl bg-rose-50 p-3"><p className="text-xs text-rose-700">Total Sell</p><p className="mt-1 text-lg font-bold text-rose-700">{formatCurrency(billing.summary.totalCredit)}</p></div>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">{billing.filters.label}</span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">{billing.filters.partyName}</span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-white">Net {formatCurrency(billing.summary.netAmount)}</span>
          </div>

          <div className="mt-4 space-y-3">
            {billing.transactions.map((transaction) => {
              const tone = getTransactionTone(transaction.type);
              return (
                <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{transaction.referenceNo}</p>
                      <p className="mt-1 text-sm text-slate-500">{getPartyLabel(transaction)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
                      <p className="mt-2 text-sm font-semibold text-ink">{formatCurrency(transaction.totalAmount || 0)}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    {transaction.items.map((item) => {
                      const unitPrice = Number(item.pricePerUnit || 0);
                      const itemAmount = Number(item.quantity || 0) * unitPrice;
                      return (
                        <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-medium text-ink">{item.product.name}</span>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Qty {formatNumber(item.quantity)} x {formatNumber(unitPrice)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Updated {formatDate(transaction.updatedAt)}</p>
                </div>
              );
            })}
            {!billing.transactions.length && !billingLoading && !waitingForSelection ? <p className="text-sm text-slate-500">No statement rows found for the selected filters.</p> : null}
          </div>
        </div>
      </Card>

      <Card className="bg-white/95">
        <h2 className="text-lg font-bold">Exports</h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <Button type="button" loading={loadingKey === "backup"} loadingText="Preparing..." onClick={() => runDownload("backup", "/backup", "daily-backup.csv")}>Download Daily CSV Backup</Button>
          <Button type="button" className="bg-slate-900 hover:bg-slate-800" loading={loadingKey === "excel"} loadingText="Preparing..." onClick={() => runDownload("excel", "/reports/export?format=excel", "inventory-report.csv")}>Export Excel CSV</Button>
          <Button type="button" className="bg-brand-600 hover:bg-brand-700" loading={loadingKey === "export-pdf"} loadingText="Preparing..." onClick={() => runDownload("export-pdf", pdfDownloadPath, "billing-statement.pdf")}>Download Billing PDF</Button>
        </div>
      </Card>
    </div>
  );
}


