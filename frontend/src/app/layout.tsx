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
  description: "Tıbbi raporları anlaşılır bir dile çeviren ve ilaç takibini kolaylaştıran mobil uygulama",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-yellow-400 min-h-screen text-[16px] flex flex-col`}
      >
        <main className="flex-grow pb-16">
          {children}
        </main>

        {/* Kalıcı Tıbbi Sorumluluk Reddi */}
        <footer className="fixed bottom-0 w-full bg-black text-yellow-400 border-t-2 border-yellow-400 p-3 text-center text-sm font-bold z-50">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </footer>
      </body>
    </html>
  );
}
