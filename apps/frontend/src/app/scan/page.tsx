import UploadDocument from '@/components/UploadDocument';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/"
          aria-label="Geri"
          className="grid place-items-center size-11 rounded-xl bg-navy-800 border border-white/10 hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Rapor Tara</h1>
      </div>
      <UploadDocument />
    </div>
  );
}
