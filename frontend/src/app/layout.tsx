import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Tıbbi raporlarınızı sadeleştirin ve ilaçlarınızı takip edin.",
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
    <html lang="tr">
      <body>
        {children}
        <footer className="w-full p-4 mt-8 bg-gray-900 text-center text-sm border-t border-gray-800">
          <p>
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </body>
    </html>
  );
}