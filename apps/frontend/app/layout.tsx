import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import I18nProvider from "./i18n/I18nProvider";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi rapor sadeleştirme ve ilaç takibi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-full flex flex-col bg-background text-foreground text-lg">
        <I18nProvider>
          <header className="p-4 border-b-2 border-foreground flex justify-between items-center">
            <h1 className="text-2xl font-bold">MediSade</h1>
          </header>
          <main className="flex-grow p-4">
            {children}
          </main>
          <footer className="p-4 border-t-2 border-foreground text-center">
            <p className="text-base font-bold">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
