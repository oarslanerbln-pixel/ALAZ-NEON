import Link from 'next/link';
import { Camera, Pill } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh] bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">MediSade&apos;ye Hoşgeldiniz</h1>

      <Link href="/scan" className="w-full flex items-center justify-center gap-4 bg-blue-700 hover:bg-blue-600 text-white border-2 border-white focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none p-8 rounded-2xl text-2xl font-bold transition-colors">
        <Camera size={48} />
        Rapor Tara
      </Link>

      <Link href="/medications" className="w-full flex items-center justify-center gap-4 bg-green-700 hover:bg-green-600 text-white border-2 border-white focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none p-8 rounded-2xl text-2xl font-bold transition-colors">
        <Pill size={48} />
        İlaçlarım
      </Link>
    </div>
  );
}
