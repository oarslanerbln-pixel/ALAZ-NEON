import type { Metadata } from "next";
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
  title: "MediSade - Sağlık Raporu Sadeleştirici",
  description: "Karmaşık tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı takip edin.",
};

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
        <header className="p-4 border-b-4 border-[#ffff00] mb-4">
          <h1 className="text-3xl font-bold text-center uppercase tracking-wider">MediSade</h1>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8">
          {children}
        </main>

        <footer className="mt-8 p-6 border-t-4 border-[#ffff00] bg-black text-center sticky bottom-0 z-50">
          <p className="text-xl font-bold">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
