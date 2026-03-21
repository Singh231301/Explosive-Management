"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, getToken } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { ReportsData } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const initialData: ReportsData = { dailyCount: 0, monthlyCount: 0, financialLedger: [], inventory: [] };

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

export default function ReportsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const [data, setData] = useState<ReportsData>(initialData);
  const [message, setMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    api.reports().then(setData).catch(() => undefined);
  }, []);

  const totalDebit = useMemo(() => data.financialLedger.reduce((sum, row) => sum + Number(row.debit), 0), [data.financialLedger]);
  const totalCredit = useMemo(() => data.financialLedger.reduce((sum, row) => sum + Number(row.credit), 0), [data.financialLedger]);

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

  return (
    <div className="space-y-4">
      <PageHeader title={t("reportsTitle", language)} subtitle={t("reportsSubtitle", language)} />
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white/95"><p className="text-sm text-slate-500">Today Entries</p><p className="mt-2 text-2xl font-bold">{formatNumber(data.dailyCount)}</p></Card>
        <Card className="bg-white/95"><p className="text-sm text-slate-500">Month Entries</p><p className="mt-2 text-2xl font-bold">{formatNumber(data.monthlyCount)}</p></Card>
        <Card className="bg-white/95"><p className="text-sm text-slate-500">Debit</p><p className="mt-2 text-2xl font-bold text-success">{formatCurrency(totalDebit)}</p></Card>
        <Card className="bg-white/95"><p className="text-sm text-slate-500">Credit</p><p className="mt-2 text-2xl font-bold text-warning">{formatCurrency(totalCredit)}</p></Card>
      </div>
      <Card className="bg-white/95">
        <h2 className="text-lg font-bold">Exports</h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <Button type="button" loading={loadingKey === "backup"} loadingText="Preparing..." onClick={() => runDownload("backup", "/backup", "daily-backup.csv")}>Download Daily CSV Backup</Button>
          <Button type="button" className="bg-slate-900 hover:bg-slate-800" loading={loadingKey === "excel"} loadingText="Preparing..." onClick={() => runDownload("excel", "/reports/export?format=excel", "inventory-report.csv")}>Export Excel CSV</Button>
          <a href="/reports/print" className="block"><Button type="button" className="bg-slate-700 hover:bg-slate-800">Open Print View</Button></a>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}
      </Card>
    </div>
  );
}
