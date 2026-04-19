import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi rapor sadeleştirme ve ilaç takibi",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased min-h-screen flex flex-col`}>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="p-4 text-center text-sm border-t border-gray-800 bg-black mt-auto">
          <p className="text-yellow-400 font-bold" role="alert">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
