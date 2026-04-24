import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediSade",
  description: "Karmaşık tıbbi raporlarınızı ve ilaç takibinizi sadeleştirin.",
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
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-yellow-400 font-sans min-h-screen flex flex-col`}
      >
        <main className="flex-1 p-4 md:p-8 w-full max-w-4xl mx-auto">
          {children}
        </main>

        {/* Permanent Medical Disclaimer */}
        <footer className="w-full bg-gray-900 border-t border-yellow-700 p-4 mt-8 text-center text-sm" role="contentinfo">
          <p className="font-bold text-yellow-500">
            UYARI: Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
