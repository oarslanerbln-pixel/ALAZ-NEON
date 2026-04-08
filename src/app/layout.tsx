import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Disclaimer from "@/components/Disclaimer";

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
  description: "Karmaşık tıbbi raporlarınızı anlaşılır bir dille özetleyen ve ilaç takibini kolaylaştıran sağlık asistanınız.",
  manifest: "/manifest.json",
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
      <body className="min-h-full flex flex-col">
        <header className="w-full p-4 border-b-4 border-[var(--foreground)] text-center">
          <h1 className="text-4xl font-bold">MediSade</h1>
        </header>

        <main className="flex-grow flex flex-col w-full p-4">
          {children}
        </main>

        <Disclaimer />
      </body>
    </html>
  );
}