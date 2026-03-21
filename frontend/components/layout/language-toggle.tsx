"use client";

import { useLanguage } from "@/components/layout/language-provider";
import { t } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="glass-card inline-flex rounded-full border border-white/60 p-1 shadow-soft">
      <button
        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${language === "en" ? "bg-brand-600 text-white shadow-sm" : "text-ink hover:bg-white/70"}`}
        onClick={() => setLanguage("en")}
        type="button"
      >
        {t("english", language)}
      </button>
      <button
        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${language === "hi" ? "bg-brand-600 text-white shadow-sm" : "text-ink hover:bg-white/70"}`}
        onClick={() => setLanguage("hi")}
        type="button"
      >
        {t("hindi", language)}
      </button>
    </div>
  );
}
