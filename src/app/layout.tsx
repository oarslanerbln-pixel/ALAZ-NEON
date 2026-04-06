import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediSade - Akıllı Sağlık Asistanı",
  description: "Tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı takip edin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // WCAG 2.1 AA Yüksek Kontrast: bg-gray-900 ve text-white (High Contrast Dark Mode)
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col antialiased text-lg`}>
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-yellow-400 tracking-wide">MediSade</h1>
          </div>
        </header>

        <main className="flex-grow max-w-4xl mx-auto w-full p-4 sm:p-6">
          {children}
        </main>

        <footer className="bg-red-900/40 border-t border-red-800 p-4 mt-auto">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-200 font-bold text-sm sm:text-base px-2">
              ⚠️ DİKKAT: Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır.
              Kesin teşhis ve tedavi için lütfen daima doktorunuza danışın.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
