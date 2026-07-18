import Link from 'next/link';
import { Camera, Pill } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">MediSade&apos;ye Hoşgeldiniz</h1>

      <Link href="/scan" className="w-full flex items-center justify-center gap-4 bg-black border-4 border-white hover:bg-gray-900 text-yellow-400 p-8 rounded-2xl text-2xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">
        <Camera size={48} className="text-yellow-400" />
        Rapor Tara
      </Link>

      <Link href="/medications" className="w-full flex items-center justify-center gap-4 bg-black border-4 border-white hover:bg-gray-900 text-yellow-400 p-8 rounded-2xl text-2xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">
        <Pill size={48} className="text-yellow-400" />
        İlaçlarım
      </Link>
    </div>
  );
}
