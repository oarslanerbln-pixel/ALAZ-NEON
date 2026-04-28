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
  title: "MediSade - Sağlık Okuryazarlığı Asistanı",
  description: "Tıbbi raporlarınızı ve ilaçlarınızı kolayca anlayın.",
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
      <body className="min-h-full flex flex-col bg-black text-yellow-400 font-sans text-[16px] md:text-[18px]">
        <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
          {children}
        </main>
        <footer className="bg-neutral-900 border-t-2 border-yellow-400 p-4 mt-auto text-center">
          <p className="font-bold text-[16px]" role="alert">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
