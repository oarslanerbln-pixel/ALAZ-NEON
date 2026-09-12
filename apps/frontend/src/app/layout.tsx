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

export const viewport: Viewport = {
  themeColor: "#000000",
}

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporlarınızı anlaşılır bir dille sadeleştirin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow p-4 md:p-8">
            {children}
          </main>
          <footer className="w-full bg-[#111] p-4 text-center mt-auto border-t-2 border-[#00ffff]">
            <p className="text-[#ffff00] text-sm font-bold max-w-2xl mx-auto">
              Uyarı: Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
