"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, clearSession, getStoredUser } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Warehouse } from "@/lib/types";

const partyLinkClass = "flex h-20 items-center justify-center rounded-2xl border border-transparent px-4 text-center text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

export default function SettingsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const user = getStoredUser();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  useEffect(() => {
    api.warehouses().then(setWarehouses).catch(() => undefined);
  }, []);

  async function saveWarehouse(event: React.FormEvent) {
    event.preventDefault();
    setSavingWarehouse(true);
    try {
      const created = await api.createWarehouse({ name: warehouseName, location: warehouseLocation });
      setWarehouses((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setWarehouseName("");
      setWarehouseLocation("");
      showToast("Warehouse added successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not add warehouse", "error");
    } finally {
      setSavingWarehouse(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("settingsTitle", language)} subtitle={t("settingsSubtitle", language)} />
      <Card className="bg-white/95">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{t("myProfile", language)}</p>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          <p><span className="font-semibold">Name:</span> {user?.name || "-"}</p>
          <p><span className="font-semibold">Email:</span> {user?.email || "-"}</p>
          <p><span className="font-semibold">Role:</span> {user?.role || "-"}</p>
          <p><span className="font-semibold">Warehouses:</span> {warehouses.length}</p>
        </div>
      </Card>
      <Card className="bg-white/95">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Warehouse Management</p>
        <form className="mt-3 space-y-3" onSubmit={(event) => void saveWarehouse(event)}>
          <Input placeholder="Warehouse name" value={warehouseName} onChange={(event) => setWarehouseName(event.target.value)} />
          <Input placeholder="Location" value={warehouseLocation} onChange={(event) => setWarehouseLocation(event.target.value)} />
          <Button type="submit" className="w-auto" loading={savingWarehouse} loadingText="Saving...">Add Warehouse</Button>
        </form>
        <div className="mt-4 space-y-3">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-ink">{warehouse.name}</p>
              <p className="mt-1 text-sm text-slate-500">{warehouse.location || "No location added"}</p>
            </div>
          ))}
          {!warehouses.length ? <p className="text-sm text-slate-500">No warehouses added yet.</p> : null}
        </div>
      </Card>
      <Card className="bg-white/95">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{t("manageParties", language)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <a href="/suppliers" className={`${partyLinkClass} bg-amber-50 text-amber-700`}>{t("supplierList", language)}</a>
          <a href="/customers" className={`${partyLinkClass} bg-fuchsia-50 text-fuchsia-700`}>{t("buyerList", language)}</a>
        </div>
      </Card>
      <Button type="button" className="bg-slate-900 hover:bg-slate-800" onClick={() => { clearSession(); window.location.href = "/login"; }}>
        {t("logout", language)}
      </Button>
    </div>
  );
}
