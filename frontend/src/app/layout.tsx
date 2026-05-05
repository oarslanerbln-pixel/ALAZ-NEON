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
  description: "Tıbbi raporlarınızı kolayca anlayın.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

function Disclaimer() {
  return (
    <div className="bg-yellow-600 text-black p-3 text-center text-sm font-bold w-full" role="alert">
      Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-yellow-400 min-h-screen flex flex-col font-sans`}
      >
        <Disclaimer />
        <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col gap-6">
          {children}
        </main>
      </body>
    </html>
  );
}
