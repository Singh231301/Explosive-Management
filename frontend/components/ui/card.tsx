import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass-card rounded-[28px] border border-white/60 p-4 shadow-soft", className)}>{children}</div>;
}
