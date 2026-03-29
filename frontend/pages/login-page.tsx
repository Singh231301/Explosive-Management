"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/forms/form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { dictionary, t } from "@/lib/i18n";
import { useLanguage } from "@/components/layout/language-provider";
import { api, getStoredUser, saveSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [email, setEmail] = useState("admin@magazine.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getStoredUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login({ email, password });
      saveSession(result.token, result.user);
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-32px)] items-center">
      <div className="w-full space-y-4">
        <div className="flex justify-end"><LanguageToggle /></div>
        <Card className="bg-white/92 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Licensed Magazine</p>
          <h1 className="mt-3 text-3xl font-bold text-ink">{dictionary.appName[language]}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("simpleAndSafe", language)}</p>
          <Form onSubmit={onSubmit}>
            <div className="pt-4">
              <label className="mb-2 block text-sm text-slate-600">{t("email", language)}</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">{t("password", language)}</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
            <Button type="submit" loading={loading} loadingText="Please wait...">{t("login", language)}</Button>
          </Form>
          {/* <div className="mt-4 space-y-1 text-xs text-slate-500">
            <p>Admin: admin@magazine.local / admin123</p>
            <p>Operator: operator@magazine.local / operator123</p>
            <p>Auditor: auditor@magazine.local / auditor123</p>
          </div> */}
        </Card>
      </div>
    </main>
  );
}
