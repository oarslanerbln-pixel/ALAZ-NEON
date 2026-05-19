import { UploadDocument } from '@/components/UploadDocument';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <Link
          href="/"
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Ana Sayfaya Dön"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">Rapor Tarama</h1>
      </div>

      <UploadDocument />
    </div>
  );
}
