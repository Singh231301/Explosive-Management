import { Card } from "@/components/ui/card";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Card className="mb-4 bg-white/95">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">PESO Magazine</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </Card>
  );
}
