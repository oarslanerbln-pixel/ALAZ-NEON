import Link from 'next/link';
import { Camera, Pill, FileText, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">MediSade</h1>
        <p className="text-yellow-200 text-lg">Sağlığınız için anlaşılır rehberiniz.</p>
      </header>

      <div className="grid gap-6">
        <Link
          href="/ocr"
          className="flex items-center gap-4 p-6 bg-gray-800 rounded-xl border-2 border-cyan-400 hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Rapor Okut: Kamerayı açıp tıbbi raporunuzu okutun"
        >
          <div className="bg-cyan-900 p-4 rounded-full">
            <Camera className="w-8 h-8 text-cyan-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-cyan-400">Rapor Okut</h2>
            <p className="text-gray-300">Evrak fotoğrafı çek ve özetle</p>
          </div>
        </Link>

        <Link
          href="/medications"
          className="flex items-center gap-4 p-6 bg-gray-800 rounded-xl border-2 border-yellow-400 hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="İlaç Takibi: Günlük ilaçlarınızı işaretleyin"
        >
          <div className="bg-yellow-900 p-4 rounded-full">
            <Pill className="w-8 h-8 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-yellow-400">İlaç Takibi</h2>
            <p className="text-gray-300">Günlük ilaçlarını işaretle</p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Link
            href="/history"
            className="flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
            aria-label="Geçmiş Raporlar"
          >
            <FileText className="w-6 h-6 text-gray-300" aria-hidden="true" />
            <span className="font-medium text-gray-200">Geçmiş</span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
            aria-label="Ayarlar"
          >
            <Settings className="w-6 h-6 text-gray-300" aria-hidden="true" />
            <span className="font-medium text-gray-200">Ayarlar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
