"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Option = { label: string; value: string };

export function Dropdown({ label, options, value, onChange, searchPlaceholder }: { label?: string; options: Option[]; value: string; onChange: (value: string) => void; searchPlaceholder?: string; }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      {label ? <span className="block text-sm font-medium text-slate-600">{label}</span> : null}
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-brand-100 bg-white px-4 py-3 text-left text-base text-ink"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? "text-ink" : "text-slate-400"}>{selected?.label || searchPlaceholder || "Select"}</span>
        <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} size={18} />
      </button>
      {open ? (
        <div className="rounded-3xl border border-brand-100 bg-white p-3 shadow-soft">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input className="pl-10" placeholder={searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${option.value === value ? "bg-brand-600 text-white" : "bg-slate-50 text-ink"}`}
                onClick={() => {
                  onChange(option.value);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
            {!filtered.length ? <p className="px-2 py-3 text-sm text-slate-400">No match found</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
