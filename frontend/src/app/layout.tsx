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
  description: "Karmaşık tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı takip edin.",
  manifest: "/manifest.json",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col font-sans text-base leading-relaxed`}
        style={{ fontSize: "16px" }}
      >
        <main className="flex-grow container mx-auto p-4 md:p-8">
          {children}
        </main>

        {/* Mandatory Medical Disclaimer Footer */}
        <footer className="w-full bg-gray-900 border-t border-gray-800 p-4 mt-auto">
          <div className="container mx-auto text-center">
            <p className="text-yellow-400 font-bold text-lg" role="alert">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
