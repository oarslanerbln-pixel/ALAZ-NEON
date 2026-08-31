import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporları anlaşılır dile çeviren ve ilaç takibini kolaylaştıran uygulama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col">
        <main className="flex-grow p-4">
          {children}
        </main>
        <footer className="p-4 bg-gray-900 border-t border-gray-800 text-center">
          <p className="text-base text-yellow-200">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}
