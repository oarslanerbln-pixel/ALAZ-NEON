import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Karmaşık tıbbi raporlarınızı anlaşılır bir dile çevirir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1 p-4">
          {children}
        </main>
        <footer className="p-4 border-t-2 border-yellow-400 mt-auto text-center text-base">
          <p>
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
