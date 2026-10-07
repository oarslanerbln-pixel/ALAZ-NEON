import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporları sadeleştirme ve ilaç takip aracı",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <div className="fixed bottom-0 left-0 w-full bg-black text-yellow-400 p-2 text-center text-sm border-t border-yellow-400 font-bold z-50">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </div>
      </body>
    </html>
  );
}
