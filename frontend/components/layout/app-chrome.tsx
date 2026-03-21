"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";

  return (
    <div className="app-shell">
      {children}
      {!hideNav ? <BottomNavigation /> : null}
    </div>
  );
}
