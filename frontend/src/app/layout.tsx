import type { Metadata } from "next";
import "./globals.css";

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Karmaşık tıbbi raporları anlaşılır bir dile çeviren sağlık okuryazarlığı uygulaması",
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
      <body className="min-h-screen flex flex-col bg-black text-white text-lg">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4 focus:bg-yellow-400 focus:text-black absolute top-0 left-0 z-50">
          Ana içeriğe geç
        </a>
        <header className="p-4 border-b-2 border-white" role="banner">
          <h1 className="text-3xl font-bold text-yellow-400">MediSade</h1>
        </header>

        {/* Permanent Medical Disclaimer as per directives */}
        <div
          className="bg-yellow-400 text-black p-4 font-bold border-b-4 border-white"
          role="alert"
          aria-live="polite"
        >
          <p>
            ⚠️ Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </div>

        <main id="main-content" className="flex-grow p-4 flex flex-col gap-8 max-w-4xl mx-auto w-full" role="main">
          {children}
        </main>

        <footer className="p-4 border-t-2 border-white text-center mt-auto" role="contentinfo">
          <p>© {new Date().getFullYear()} MediSade</p>
        </footer>
      </body>
    </html>
  );
}
