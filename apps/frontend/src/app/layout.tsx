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
  description: "Karmaşık tıbbi raporlarınızı anlaşılır bir dile çevirin ve ilaç takibinizi kolaylaştırın.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="bg-red-900 text-white text-center p-3 font-bold text-lg border-b-4 border-yellow-400">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </div>
        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
