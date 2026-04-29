import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import '../globals.css';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-black text-white text-lg antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow p-4">
              {children}
            </main>
            <footer className="p-4 bg-gray-900 text-center border-t border-gray-800">
              <p className="text-yellow-400 font-bold" role="alert" aria-live="polite">
                {messages.Index && (messages.Index as any).disclaimer}
              </p>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
