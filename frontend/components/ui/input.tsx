import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-12 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-base text-ink outline-none ring-brand-300 placeholder:text-slate-400 focus:ring-2", className)} {...props} />;
}
