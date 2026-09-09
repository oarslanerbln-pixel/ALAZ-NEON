import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "../components/I18nProvider";

export const metadata: Metadata = {
  title: "MediSade",
  description: "Medical Report Simplifier",
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <div className="min-h-screen p-4 flex flex-col items-center">
            <div className="w-full text-center p-2 mb-4 border-2 border-red-500 font-bold">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </div>
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}