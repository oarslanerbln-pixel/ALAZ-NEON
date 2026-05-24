import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UploadDocument from '@/components/UploadDocument';

export default function ScanPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto min-h-screen pb-20">
      <header className="flex items-center gap-4 py-4 border-b border-gray-800">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Ana sayfaya dön"
        >
          <ArrowLeft size={28} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Rapor Tara</h1>
      </header>

      <main className="flex flex-col flex-1">
        <UploadDocument />
      </main>
    </div>
  );
}
