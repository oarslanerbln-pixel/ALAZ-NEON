import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
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
  description: "Tıbbi raporlarınızı ve ilaçlarınızı kolayca takip edin.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white text-lg`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
            <main className="flex-grow p-4">{children}</main>
            <footer className="p-4 bg-gray-900 text-center text-base border-t border-gray-800 text-yellow-400 font-bold">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
