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
  description: "Karmaşık tıbbi raporlarınızı kolayca anlayın.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-black text-lg`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="bg-black text-white p-4">
            <h1 className="text-3xl font-extrabold text-center">MediSade</h1>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>

          <footer className="bg-yellow-100 border-t-4 border-yellow-400 p-6 mt-auto">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl font-bold text-black flex items-center justify-center gap-2">
                <span className="text-3xl" aria-hidden="true">⚠️</span>
                DİKKAT: Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
