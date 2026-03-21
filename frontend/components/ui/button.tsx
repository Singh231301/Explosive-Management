import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("min-h-12 w-full rounded-2xl bg-brand-600 px-4 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50", className)} {...props} />;
}
