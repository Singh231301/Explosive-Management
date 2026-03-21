import type { AppProps } from "next/app";
import { AppChrome } from "@/components/layout/app-chrome";
import { LanguageProvider } from "@/components/layout/language-provider";
import { ToastProvider } from "@/components/layout/toast-provider";
import "@/styles/globals.css";

export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppChrome>
          <Component {...pageProps} />
        </AppChrome>
      </ToastProvider>
    </LanguageProvider>
  );
}
