import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { LanguageProvider } from "@/components/layout/language-provider";
import { ToastProvider } from "@/components/layout/toast-provider";

export const metadata: Metadata = {
  title: "Explosive Manager",
  description: "Frontend app for explosive inventory management"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <LanguageProvider>
          <ToastProvider>
            <AppChrome>{children}</AppChrome>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
