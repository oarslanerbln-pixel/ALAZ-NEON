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
  description: "Karmaşık tıbbi raporları anlaşılır bir dile çeviren ve ilaç takibini kolaylaştıran mobil uygulama.",
  manifest: "/manifest.json",
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
    <html lang="tr" className="dark">
      {/* High Contrast Mode classes: text-xl (min 16px font), bg-black text-white for high contrast */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white text-xl flex flex-col min-h-screen`}
      >
        <div className="flex-grow">
          {children}
        </div>
        <footer className="bg-gray-900 text-yellow-300 p-4 text-center text-sm font-bold border-t-2 border-yellow-300 mt-auto">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </footer>
      </body>
    </html>
  );
}
