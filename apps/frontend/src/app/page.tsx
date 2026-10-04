import Link from 'next/link';
import { Camera, Pill } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">MediSade&apos;ye Hoş Geldiniz</h1>

      <div className="grid gap-6">
        <Link
          href="/ocr"
          className="flex flex-col items-center justify-center p-8 border-4 border-cyan-400 rounded-2xl hover:bg-cyan-900 transition-colors bg-black"
        >
          <Camera size={64} className="text-cyan-400 mb-4" />
          <span className="text-2xl font-bold text-cyan-400">Rapor Oku</span>
        </Link>

        <Link
          href="/medications"
          className="flex flex-col items-center justify-center p-8 border-4 border-cyan-400 rounded-2xl hover:bg-cyan-900 transition-colors bg-black"
        >
          <Pill size={64} className="text-cyan-400 mb-4" />
          <span className="text-2xl font-bold text-cyan-400">İlaçlarım</span>
        </Link>
      </div>
    </div>
  );
}
