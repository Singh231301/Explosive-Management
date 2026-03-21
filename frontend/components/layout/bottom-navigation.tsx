"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/inventory", label: "Stock" },
  { href: "/purchase", label: "Buy" },
  { href: "/usage", label: "Use" },
  { href: "/transactions", label: "Edit" },
  { href: "/settings", label: "Profile" }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-[448px] -translate-x-1/2 rounded-[28px] bg-white/95 p-2 shadow-soft backdrop-blur">
      <div className="grid grid-cols-6 gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`rounded-2xl px-2 py-3 text-center text-[11px] font-semibold ${active ? "bg-brand-600 text-white" : "text-slate-500"}`}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
