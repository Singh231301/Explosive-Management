import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
};

export function Button({ className, type = "button", loading = false, loadingText, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}
