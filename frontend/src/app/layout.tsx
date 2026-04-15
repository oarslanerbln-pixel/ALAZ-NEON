import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Disclaimer from "@/components/Disclaimer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporları anlaşılır bir dile çeviren ve ilaç takibini kolaylaştıran sağlık okuryazarlığı uygulaması.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Disclaimer />
        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
