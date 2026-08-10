import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi rapor sadeleştirme ve ilaç takip uygulaması",
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
      <body
        className={`${inter.className} min-h-screen bg-black text-white antialiased`}
      >
        <main className="pb-24">{children}</main>
        <footer className="fixed bottom-0 w-full bg-neutral-900 p-4 border-t border-neutral-800 text-center">
          <p className="text-base text-neutral-300 font-medium">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
