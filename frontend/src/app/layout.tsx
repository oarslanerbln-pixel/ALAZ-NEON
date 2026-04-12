import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Karmaşık tıbbi raporlarınızı sadeleştirin ve ilaçlarınızı kolayca takip edin.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col hc-bg hc-text text-base">
        <main className="flex-grow flex flex-col p-4 max-w-lg mx-auto w-full">
          {children}
        </main>

        {/* Mandatory Medical Disclaimer Footer */}
        <footer className="mt-auto p-4 border-t-2 border-[var(--color-hc-border)] bg-[var(--color-hc-bg)] text-center">
          <p className="text-[16px] font-bold text-[var(--color-hc-text)]">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
