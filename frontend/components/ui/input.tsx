import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-brand-100 bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-200 placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  );
}
