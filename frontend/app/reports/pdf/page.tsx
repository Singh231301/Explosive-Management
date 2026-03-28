import { Suspense } from "react";
import ReportsPdfPage from "@/pages/reports-pdf-page";

export default function ReportsPdfRoute() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading PDF preview...</div>}>
      <ReportsPdfPage />
    </Suspense>
  );
}
