"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ReportsData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const initialData: ReportsData = { dailyCount: 0, monthlyCount: 0, financialLedger: [], inventory: [] };

export default function PrintReportPage() {
  const [data, setData] = useState<ReportsData>(initialData);

  useEffect(() => {
    api.reports().then(setData).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4 bg-white text-black">
      <PageHeader title="Printable Report" subtitle="Use browser print and save as PDF" />
      <Card className="bg-white">
        <div className="space-y-2 text-sm">
          {data.inventory.map((row) => (
            <div key={row.id} className="flex items-center justify-between border-b border-slate-100 py-2">
              <span>{row.product.name}</span>
              <span>{formatNumber(row.quantity)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
