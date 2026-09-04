import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nProvider from "../providers/I18nProvider";
import Disclaimer from "../components/Disclaimer";

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
  description: "Tıbbi rapor sadeleştirme ve ilaç takip uygulaması",
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
      <body className="min-h-full flex flex-col bg-black text-yellow-400">
        <I18nProvider>
          <div className="flex-1">
            {children}
          </div>
          <Disclaimer />
        </I18nProvider>
      </body>
    </html>
  );
}
