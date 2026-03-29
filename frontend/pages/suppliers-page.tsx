"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { MasterDataForm } from "@/components/forms/master-data-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PartyEditDialog } from "@/components/ui/party-edit-dialog";
import { PartyHistoryList } from "@/components/ui/party-history-list";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Party } from "@/lib/types";

export default function SuppliersPage() {
  const auth = useRequireAuth(["ADMIN", "OPERATOR"]);
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [editTarget, setEditTarget] = useState<Party | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.authorized) return;
    api.suppliers().then(setSuppliers).catch(() => undefined);
  }, [auth.authorized]);

  if (!auth.ready || !auth.authorized) return null;

  async function editSupplier(payload: { name: string; phone: string; address: string }) {
    if (!editTarget) return;
    try {
      setSavingEdit(true);
      const updated = await api.updateSupplier(editTarget.id, payload);
      setSuppliers((current) => current.map((row) => (row.id === editTarget.id ? updated : row)));
      setEditTarget(null);
      showToast("Supplier updated successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update supplier", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeSupplier() {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      await api.deleteSupplier(deleteTarget.id);
      setSuppliers((current) => current.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Supplier deleted successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete supplier", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("suppliersTitle", language)} subtitle={t("suppliersSubtitle", language)} />
      <MasterDataForm resource="suppliers" title="Add Supplier" placeholders={{ name: "Supplier name", phone: "Phone", address: "Address" }} onSaved={(party) => setSuppliers((current) => [party, ...current])} />
      <PartyHistoryList
        parties={suppliers}
        kind="supplier"
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        loadTransactions={(partyId, page) => api.supplierTransactions(partyId, page, 10)}
      />

      <PartyEditDialog
        open={Boolean(editTarget)}
        title="Edit Supplier"
        saving={savingEdit}
        party={editTarget}
        onSave={editSupplier}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete supplier?"
        description={`This will permanently remove ${deleteTarget?.name || "this supplier"}.`}
        confirmLabel="Delete"
        cancelLabel={t("cancel", language)}
        tone="danger"
        loading={deletingId === deleteTarget?.id}
        onConfirm={removeSupplier}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
