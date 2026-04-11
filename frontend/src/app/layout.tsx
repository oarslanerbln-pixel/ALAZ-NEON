import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporlarınızı sadeleştirin ve ilaçlarınızı kolayca takip edin.",
  manifest: "/manifest.json",
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
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="bg-primary text-background p-4 font-bold text-center border-b-4 border-border">
          <h1>MediSade</h1>
        </header>

        {/* Permanent Medical Disclaimer Requirement */}
        <div className="bg-primary-dark text-foreground p-3 text-center border-b border-border font-bold text-lg" role="alert">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </div>

        <main className="flex-1 p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
