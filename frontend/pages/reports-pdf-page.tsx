"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFileUrl, getToken } from "@/lib/api";

export default function ReportsPdfPage() {
  const searchParams = useSearchParams();
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => searchParams?.toString() || "", [searchParams]);

  useEffect(() => {
    let active = true;
    let nextUrl = "";

    async function loadPdf() {
      try {
        setLoading(true);
        setError("");
        const token = getToken();
        const response = await fetch(apiFileUrl(`/reports/billing/pdf${query ? `?${query}` : ""}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error("Unable to load PDF preview");
        }

        const blob = await response.blob();
        nextUrl = URL.createObjectURL(blob);
        if (!active) return;
        setPdfUrl(nextUrl);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load PDF preview");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPdf();

    return () => {
      active = false;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [query]);

  function downloadPdf() {
    if (!pdfUrl) return;
    const anchor = document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = "billing-statement.pdf";
    anchor.click();
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
          <div>
            <h1 className="text-xl font-bold text-ink">Billing PDF Preview</h1>
            <p className="mt-1 text-sm text-slate-500">Preview the generated bill and download it as a PDF.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="w-auto bg-slate-900 hover:bg-slate-800" onClick={() => window.close()}>Close</Button>
            <Button type="button" className="w-auto bg-brand-600 hover:bg-brand-700" onClick={downloadPdf} disabled={!pdfUrl || loading}>Download PDF</Button>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-3 shadow-soft">
          {loading ? <div className="flex min-h-[70vh] items-center justify-center text-sm text-slate-500">Loading PDF preview...</div> : null}
          {error ? <div className="flex min-h-[70vh] items-center justify-center text-sm text-rose-600">{error}</div> : null}
          {!loading && !error && pdfUrl ? <iframe title="Billing PDF Preview" src={pdfUrl} className="h-[80vh] w-full rounded-2xl border border-slate-200" /> : null}
        </div>
      </div>
    </div>
  );
}
