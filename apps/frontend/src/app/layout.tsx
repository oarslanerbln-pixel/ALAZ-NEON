import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporları anlaşılır bir dile çeviren ve ilaç takibini kolaylaştıran uygulama.",
  manifest: "/manifest.json",
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
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-black text-yellow-400 min-h-screen text-[16px] sm:text-lg`}>
        <div className="max-w-md mx-auto min-h-screen bg-gray-900 flex flex-col relative">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <footer className="bg-gray-950 p-4 text-center text-sm border-t border-gray-800 sticky bottom-0 z-50">
            <p className="text-yellow-200 font-bold">
              ⚠️ Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
