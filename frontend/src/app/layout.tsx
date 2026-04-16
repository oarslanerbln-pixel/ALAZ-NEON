import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporları basitleştiren ve ilaç takibini kolaylaştıran uygulama",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} antialiased bg-black text-white text-base min-h-screen flex flex-col`}>
        {/* Kalıcı Tıbbi Feragatname */}
        <header className="w-full bg-yellow-400 text-black p-3 text-center text-sm font-bold border-b-4 border-yellow-600" role="banner">
          ⚠️ Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </header>

        <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6" role="main">
          {children}
        </main>

        <footer className="w-full bg-gray-900 border-t border-gray-700 p-4 text-center text-sm mt-auto" role="contentinfo">
          &copy; {new Date().getFullYear()} MediSade. Tüm hakları saklıdır.
        </footer>
      </body>
    </html>
  );
}
