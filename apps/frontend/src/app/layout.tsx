import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediSade - Tıbbi Rapor Çevirici ve İlaç Takibi',
  description: 'Karmaşık tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı takip edin.',
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-black text-yellow-300 min-h-screen text-lg`}>
        {/* Persistent Medical Disclaimer per requirements */}
        <div className="bg-yellow-300 text-black p-3 text-center font-bold text-sm sm:text-base sticky top-0 z-50">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </div>
        <main className="container mx-auto p-4 max-w-lg">
          {children}
        </main>
      </body>
    </html>
  );
}
