import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UploadDocument from '@/components/UploadDocument';

export default function OCRPage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="p-2 border-2 border-cyan-400 rounded-full hover:bg-cyan-900 transition-colors" aria-label="Ana Sayfaya Dön">
          <ArrowLeft className="text-cyan-400" />
        </Link>
        <h1 className="text-3xl font-bold">Rapor Oku</h1>
      </div>

      <p className="text-xl mb-4">
        Tıbbi raporunuzun veya tahlil sonucunuzun fotoğrafını çekin ya da dosya olarak yükleyin.
        Yapay zeka anlaşılır bir dilde özetleyecektir.
      </p>

      <UploadDocument />
    </div>
  );
}
