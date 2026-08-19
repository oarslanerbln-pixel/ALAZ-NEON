import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Netçe",
  description: "Tıbbi raporlarınızı ve ilaçlarınızı kolayca takip edin.",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#0a1f44",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased bg-navy-950 text-ink-100 text-lg selection:bg-gold-500/30`}
      >
        <ServiceWorkerRegister />
        <AuthProvider>
          <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
            <main className="flex-grow p-4">{children}</main>
            <footer className="p-4 bg-navy-900 text-center text-sm border-t border-white/10 text-amber-400 font-semibold">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
