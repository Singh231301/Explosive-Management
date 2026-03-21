"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { MasterDataForm } from "@/components/forms/master-data-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Party } from "@/lib/types";

export default function CustomersPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Party[]>([]);

  useEffect(() => {
    api.customers().then(setCustomers).catch(() => undefined);
  }, []);

  async function editCustomer(party: Party) {
    try {
      const name = window.prompt("Customer name", party.name);
      if (!name) return;
      const phone = window.prompt("Phone", party.phone || "") || "";
      const address = window.prompt("Address", party.address || "") || "";
      const updated = await api.updateCustomer(party.id, { name, phone, address });
      setCustomers((current) => current.map((row) => (row.id === party.id ? updated : row)));
      showToast("Customer updated successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update customer", "error");
    }
  }

  async function removeCustomer(id: string) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.deleteCustomer(id);
      setCustomers((current) => current.filter((row) => row.id !== id));
      showToast("Customer deleted successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete customer", "error");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("customersTitle", language)} subtitle={t("customersSubtitle", language)} />
      <MasterDataForm resource="customers" title="Add Customer" placeholders={{ name: "Customer name", phone: "Phone", address: "Address" }} onSaved={(party) => setCustomers((current) => [party, ...current])} />
      <div className="space-y-3">
        {customers.map((party) => (
          <Card key={party.id} className="bg-white/95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold">{party.name}</p>
                <p className="text-sm text-slate-500">{party.phone || "-"}</p>
                <p className="mt-1 text-sm text-slate-500">{party.address || "-"}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" className="w-auto bg-slate-900 px-3 py-2" onClick={() => editCustomer(party)}>Edit</Button>
                <Button type="button" className="w-auto bg-danger px-3 py-2" onClick={() => removeCustomer(party.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
