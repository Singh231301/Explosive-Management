"use client";

import { TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "default", loading = false, onConfirm, onClose }: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClass = tone === "danger" ? "bg-danger hover:bg-rose-700" : "bg-brand-600 hover:bg-brand-700";

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${tone === "danger" ? "bg-rose-100 text-rose-600" : "bg-brand-50 text-brand-600"}`}>
              <TriangleAlert size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <button type="button" className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={onClose} disabled={loading}>
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="button" className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" className={confirmClass} loading={loading} loadingText="Please wait..." onClick={() => void onConfirm()}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
