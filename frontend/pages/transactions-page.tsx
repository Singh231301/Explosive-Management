"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { TransactionRecord } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export default function TransactionsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [rows, setRows] = useState<TransactionRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    api.transactions().then(setRows).catch(() => undefined);
  }, []);

  function openEdit(row: TransactionRecord) {
    const firstItem = row.items[0];
    if (!firstItem?.productId) return;
    setEditingId(row.id);
    setQuantity(String(firstItem.quantity));
    setPricePerUnit(String(firstItem.pricePerUnit || 0));
    setNotes(row.notes || "");
  }

  async function saveEdit(row: TransactionRecord) {
    try {
      const firstItem = row.items[0];
      if (!firstItem?.productId) return;

      setSavingId(row.id);
      const updated = await api.updateTransaction(row.id, {
        type: row.type,
        warehouseId: row.warehouseId || "default-warehouse",
        supplierId: row.supplierId || null,
        customerId: row.customerId || null,
        notes,
        items: [{ productId: firstItem.productId, quantity: Number(quantity), pricePerUnit: Number(pricePerUnit) }]
      });

      setRows((current) => current.map((item) => (item.id === row.id ? updated : item)));
      setEditingId(null);
      showToast("Transaction updated successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update transaction", "error");
    } finally {
      setSavingId(null);
    }
  }

  async function removeTransaction() {
    if (!deleteId) return;
    try {
      setDeletingId(deleteId);
      await api.deleteTransaction(deleteId);
      setRows((current) => current.filter((row) => row.id !== deleteId));
      setDeleteId(null);
      showToast("Transaction deleted successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete transaction", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("transactionsTitle", language)} subtitle={t("manageTransactionsSubtitle", language)} />
      <div className="space-y-3">
        {rows.map((row) => {
          const isEditing = editingId === row.id;
          return (
            <Card key={row.id} className="bg-white/95">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{row.items[0]?.product.name || row.referenceNo}</p>
                  <p className="text-sm text-slate-500">Qty {formatNumber(row.totalQuantity || 0)} | {formatDate(row.createdAt)}</p>
                  <p className="text-xs text-slate-400">{row.referenceNo}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{row.type}</span>
              </div>

              {isEditing ? (
                <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-3">
                  <Input type="number" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t("quantity", language)} />
                  <Input type="number" step="0.01" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} placeholder={t("pricePerUnit", language)} />
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notes", language)} />
                  <div className="flex gap-2">
                    <Button type="button" className="w-auto min-w-0 bg-brand-600" loading={savingId === row.id} loadingText="Saving..." onClick={() => saveEdit(row)}>{t("saveChanges", language)}</Button>
                    <Button type="button" className="w-auto min-w-0 bg-slate-700 hover:bg-slate-800" onClick={() => setEditingId(null)} disabled={savingId === row.id}>{t("cancel", language)}</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button type="button" className="w-auto min-w-0 bg-slate-900 hover:bg-slate-800" onClick={() => openEdit(row)}>{t("edit", language)}</Button>
                  <Button type="button" className="w-auto min-w-0 bg-danger hover:bg-rose-700" onClick={() => setDeleteId(row.id)}>{t("delete", language)}</Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete transaction?"
        description="This will remove the transaction and recalculate stock balances."
        confirmLabel="Delete"
        cancelLabel={t("cancel", language)}
        tone="danger"
        loading={deletingId === deleteId}
        onConfirm={removeTransaction}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
