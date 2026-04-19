import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 min-h-[80vh]">
      <h1 className="text-4xl font-extrabold text-center">MediSade'ye Hoş Geldiniz</h1>
      <p className="text-xl text-center max-w-md">
        Karmaşık tıbbi raporlarınızı anlayın ve ilaçlarınızı kolayca takip edin.
      </p>

      <div className="flex flex-col w-full max-w-xs space-y-4">
        <Link
          href="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-center text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-colors"
          role="button"
        >
          Rapor Yükle / Çek
        </Link>
        <Link
          href="/dashboard"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl text-center text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-colors"
          role="button"
        >
          İlaç Takibi
        </Link>
      </div>
    </div>
  );
}
