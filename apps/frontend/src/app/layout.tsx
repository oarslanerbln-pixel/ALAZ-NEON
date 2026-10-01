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
  title: "MediSade",
  description: "Tıbbi raporları sadeleştiren araç",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
      >
        <main className="flex-grow">{children}</main>
        <footer className="w-full p-4 mt-8 text-center text-lg font-bold border-t-2 border-current">
          <p>
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır.
            Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
