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
  description: "Karmaşık tıbbi raporlarınızı anlaşılır bir dile çevirin.",
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
      <body className="min-h-full flex flex-col bg-yellow-200 text-black text-lg p-4 font-sans">
        <main className="flex-grow">
          {children}
        </main>
        <footer className="mt-8 pt-4 border-t-4 border-black text-center font-bold text-xl">
          <p>
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır.
            Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
