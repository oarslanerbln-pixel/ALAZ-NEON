import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi rapor sadeleştirme ve ilaç takibi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-yellow-400">
        <header className="p-4 border-b-4 border-yellow-400 font-bold text-2xl text-center">
          MediSade
        </header>

        <main className="flex-1 p-6 flex flex-col gap-8 max-w-3xl mx-auto w-full">
          {children}
        </main>

        <footer className="p-4 border-t-4 border-yellow-400 bg-black text-yellow-400 text-center font-bold">
          <p role="contentinfo">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
