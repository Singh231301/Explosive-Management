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

export default function CustomersPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Party[]>([]);
  const [editTarget, setEditTarget] = useState<Party | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.customers().then(setCustomers).catch(() => undefined);
  }, []);

  async function editCustomer(payload: { name: string; phone: string; address: string }) {
    if (!editTarget) return;
    try {
      setSavingEdit(true);
      const updated = await api.updateCustomer(editTarget.id, payload);
      setCustomers((current) => current.map((row) => (row.id === editTarget.id ? updated : row)));
      setEditTarget(null);
      showToast("Customer updated successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update customer", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeCustomer() {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      await api.deleteCustomer(deleteTarget.id);
      setCustomers((current) => current.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Customer deleted successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete customer", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("customersTitle", language)} subtitle={t("customersSubtitle", language)} />
      <MasterDataForm resource="customers" title="Add Customer" placeholders={{ name: "Customer name", phone: "Phone", address: "Address" }} onSaved={(party) => setCustomers((current) => [party, ...current])} />
      <PartyHistoryList
        parties={customers}
        kind="customer"
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        loadTransactions={(partyId, page) => api.customerTransactions(partyId, page, 10)}
      />

      <PartyEditDialog
        open={Boolean(editTarget)}
        title="Edit Customer"
        saving={savingEdit}
        party={editTarget}
        onSave={editCustomer}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer?"
        description={`This will permanently remove ${deleteTarget?.name || "this customer"}.`}
        confirmLabel="Delete"
        cancelLabel={t("cancel", language)}
        tone="danger"
        loading={deletingId === deleteTarget?.id}
        onConfirm={removeCustomer}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
