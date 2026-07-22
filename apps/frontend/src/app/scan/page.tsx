import UploadDocument from '@/components/UploadDocument';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

export default function ScanPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
          <h1 className="text-2xl font-bold">Rapor Tara</h1>
        </div>
        <UploadDocument />
      </div>
    </AuthGuard>
  );
}
