import UploadDocument from '@/components/UploadDocument';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg font-bold hover:bg-gray-700 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
        >
          <ChevronLeft size={20} />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Rapor Tara</h1>
      </div>
      <UploadDocument />
    </div>
  );
}
