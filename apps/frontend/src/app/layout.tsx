import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediSade - Sağlık Okuryazarlığı Asistanı',
  description: 'Karmaşık tıbbi raporları anlaşılır dile çeviren ve ilaç takibini kolaylaştıran asistanınız.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased bg-black text-white">{children}</body>
    </html>
  );
}
