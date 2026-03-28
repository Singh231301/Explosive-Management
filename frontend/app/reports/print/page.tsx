import { Suspense } from "react";
import PrintReportPage from "@/pages/reports-print-page";

export default function ReportsPrintPageRoute() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading statement...</div>}>
      <PrintReportPage />
    </Suspense>
  );
}
