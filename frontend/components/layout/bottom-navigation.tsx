"use client";

import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/inventory", label: "Stock" },
  { href: "/purchase", label: "Buy" },
  { href: "/usage", label: "Sell" },
  { href: "/reports", label: "Bill" },
  { href: "/transactions", label: "Txn" }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-auto fixed bottom-4 left-1/2 z-[100] w-[calc(100%-24px)] max-w-[448px] -translate-x-1/2 rounded-[28px] bg-white/95 p-2 shadow-soft backdrop-blur">
      <div className="grid grid-cols-6 gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                if (pathname === item.href) return;
                window.location.href = item.href;
              }}
              className={`touch-manipulation rounded-2xl px-2 py-3 text-center text-[11px] font-semibold transition-colors ${active ? "bg-brand-600 text-white" : "text-slate-500"}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
