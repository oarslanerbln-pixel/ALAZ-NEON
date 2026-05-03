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
  description: "Tıbbi rapor sadeleştirme ve ilaç takibi aracı.",
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
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-yellow-400 text-lg">
        <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
          {children}
        </main>
        <footer className="w-full bg-yellow-400 text-black p-4 text-center font-bold text-base mt-auto">
          <p>
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır.
            Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
