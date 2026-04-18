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
  description: "Karmaşık tıbbi raporları anlaşılaır kılan ve ilaç takibini kolaylaştıran sağlik uygulaması.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white text-[16px] md:text-[18px]`}
      >
        <div className="fixed top-0 w-full bg-red-900 text-white text-center text-sm py-2 px-4 z-50 font-bold border-b border-red-700 shadow-md">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </div>
        <main className="pt-16 min-h-screen p-4 flex flex-col items-center max-w-4xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
