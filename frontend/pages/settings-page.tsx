"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { useToast } from "@/components/layout/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, clearSession, getStoredUser } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { AppUser, SessionUser, UserRole, Warehouse } from "@/lib/types";

const partyLinkClass = "flex h-20 items-center justify-center rounded-2xl border border-transparent px-4 text-center text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

export default function SettingsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("OPERATOR");
  const [savingUser, setSavingUser] = useState(false);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const [savingPasswordId, setSavingPasswordId] = useState<string | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    api.warehouses().then(setWarehouses).catch(() => undefined);
    if (storedUser?.role === "ADMIN") {
      api.users().then((rows) => {
        setUsers(rows);
        setRoleDrafts(Object.fromEntries(rows.map((row) => [row.id, row.role as UserRole])));
      }).catch(() => undefined);
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const canManageParties = user?.role === "ADMIN" || user?.role === "OPERATOR";
  const roleOptions = useMemo(() => ["ADMIN", "OPERATOR", "AUDITOR"] as const, []);

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

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setSavingUser(true);
    try {
      const created = await api.createUser({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole });
      setUsers((current) => [...current, created]);
      setRoleDrafts((current) => ({ ...current, [created.id]: created.role }));
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("OPERATOR");
      showToast("User created successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not create user", "error");
    } finally {
      setSavingUser(false);
    }
  }

  async function saveUserPassword(target: AppUser) {
    const password = passwordDrafts[target.id]?.trim();
    if (!password) {
      showToast("Enter a new password first", "error");
      return;
    }

    setSavingPasswordId(target.id);
    try {
      const updated = await api.updateUserPassword(target.id, { password });
      setUsers((current) => current.map((row) => (row.id === target.id ? updated : row)));
      setPasswordDrafts((current) => ({ ...current, [target.id]: "" }));
      showToast(`Password updated for ${target.name}`, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update password", "error");
    } finally {
      setSavingPasswordId(null);
    }
  }

  async function saveUserRole(target: AppUser) {
    const role = roleDrafts[target.id] || target.role;
    setSavingRoleId(target.id);
    try {
      const updated = await api.updateUserRole(target.id, { role });
      setUsers((current) => current.map((row) => (row.id === target.id ? updated : row)));
      setRoleDrafts((current) => ({ ...current, [target.id]: updated.role }));
      showToast(`Role updated for ${target.name}`, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update role", "error");
    } finally {
      setSavingRoleId(null);
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

      {isAdmin ? (
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
      ) : null}

      {isAdmin ? (
        <Card className="bg-white/95">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">User Management</p>
          <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={(event) => void createUser(event)}>
            <Input placeholder="Full name" value={newUserName} onChange={(event) => setNewUserName(event.target.value)} />
            <Input placeholder="Email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} />
            <Input type="password" placeholder="Temporary password" value={newUserPassword} onChange={(event) => setNewUserPassword(event.target.value)} />
            <select className="h-11 rounded-xl border border-brand-100 bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-200" value={newUserRole} onChange={(event) => setNewUserRole(event.target.value as UserRole)}>
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <Button type="submit" className="w-auto" loading={savingUser} loadingText="Saving...">Add User</Button>
          </form>

          <div className="mt-4 space-y-3">
            {users.map((managedUser) => (
              <div key={managedUser.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{managedUser.name}</p>
                    <p className="text-sm text-slate-500">{managedUser.email}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{managedUser.role}</span>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="flex gap-2">
                    <select className="h-11 min-w-[140px] rounded-xl border border-brand-100 bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-200" value={roleDrafts[managedUser.id] || managedUser.role} onChange={(event) => setRoleDrafts((current) => ({ ...current, [managedUser.id]: event.target.value as UserRole }))}>
                      {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <Button type="button" className="w-auto bg-slate-900 hover:bg-slate-800" loading={savingRoleId === managedUser.id} loadingText="Saving..." onClick={() => saveUserRole(managedUser)}>Save Role</Button>
                  </div>
                  <div className="flex gap-2">
                    <Input type="password" placeholder="New password" value={passwordDrafts[managedUser.id] || ""} onChange={(event) => setPasswordDrafts((current) => ({ ...current, [managedUser.id]: event.target.value }))} />
                    <Button type="button" className="w-auto bg-brand-600" loading={savingPasswordId === managedUser.id} loadingText="Saving..." onClick={() => saveUserPassword(managedUser)}>Change Password</Button>
                  </div>
                </div>
              </div>
            ))}
            {!users.length ? <p className="text-sm text-slate-500">No users found yet.</p> : null}
          </div>
        </Card>
      ) : (
        <Card className="bg-white/95 text-sm text-slate-500">
          Password changes and user management are handled by the admin account in this setup.
        </Card>
      )}

      {canManageParties ? (
        <Card className="bg-white/95">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{t("manageParties", language)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a href="/suppliers" className={`${partyLinkClass} bg-amber-50 text-amber-700`}>{t("supplierList", language)}</a>
            <a href="/customers" className={`${partyLinkClass} bg-fuchsia-50 text-fuchsia-700`}>{t("buyerList", language)}</a>
          </div>
        </Card>
      ) : null}

      <Button type="button" className="bg-slate-900 hover:bg-slate-800" onClick={() => { clearSession(); window.location.href = "/login"; }}>
        {t("logout", language)}
      </Button>
    </div>
  );
}
