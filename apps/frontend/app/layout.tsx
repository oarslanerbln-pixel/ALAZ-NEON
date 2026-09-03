import type { Metadata, Viewport } from "next";
import { Disclaimer } from "@/components/Disclaimer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSade - Sağlık Okuryazarlığı Uygulaması",
  description: "Tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı takip edin.",
  manifest: "/manifest.json"
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
      <body className="antialiased min-h-screen flex flex-col">
        <main className="flex-grow flex flex-col p-4 md:p-8">
          {children}
        </main>
        <Disclaimer />
      </body>
    </html>
  );
}
