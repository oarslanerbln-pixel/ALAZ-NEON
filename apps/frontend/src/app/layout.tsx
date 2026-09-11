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
  description: "Tıbbi rapor sadeleştirme ve ilaç takip aracı.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="p-4 bg-gray-900 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-center text-[var(--interactive)]">MediSade</h1>
          </header>
          <main className="flex-grow p-4">
            {children}
          </main>
          <footer className="p-4 bg-gray-900 text-center text-sm mt-auto border-t border-gray-800">
            <p className="font-bold">Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
