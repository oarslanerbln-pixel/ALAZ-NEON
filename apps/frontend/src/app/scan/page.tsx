import UploadDocument from '@/components/UploadDocument';
import Link from 'next/link';

export default function ScanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">Geri</Link>
        <h1 className="text-2xl font-bold">Rapor Tara</h1>
      </div>
      <UploadDocument />
    </div>
  );
}
