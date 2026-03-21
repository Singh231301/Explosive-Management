"use client";

import { useLanguage } from "@/components/layout/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearSession, getStoredUser } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";

const partyLinkClass = "flex h-20 items-center justify-center rounded-2xl border border-transparent px-4 text-center text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

export default function SettingsPage() {
  useRequireAuth();
  const { language } = useLanguage();
  const user = getStoredUser();

  return (
    <div className="space-y-4">
      <PageHeader title={t("settingsTitle", language)} subtitle={t("settingsSubtitle", language)} />
      <Card className="bg-white/95">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{t("myProfile", language)}</p>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          <p><span className="font-semibold">Name:</span> {user?.name || "-"}</p>
          <p><span className="font-semibold">Email:</span> {user?.email || "-"}</p>
          <p><span className="font-semibold">Role:</span> {user?.role || "-"}</p>
          <p><span className="font-semibold">Warehouse:</span> Main Magazine</p>
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
