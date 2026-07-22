"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, Pill } from 'lucide-react';
import { getToken } from '@/lib/auth';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8 text-center">MediSade&apos;ye Hoşgeldiniz</h1>

      {loggedIn === false ? (
        <>
          <Link href="/login" className="w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors">
            Giriş Yap
          </Link>
          <Link href="/register" className="w-full flex items-center justify-center gap-4 bg-gray-800 hover:bg-gray-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors">
            Kayıt Ol
          </Link>
        </>
      ) : loggedIn === true ? (
        <>
          <Link href="/scan" className="w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors">
            <Camera size={48} />
            Rapor Tara
          </Link>

          <Link href="/medications" className="w-full flex items-center justify-center gap-4 bg-green-600 hover:bg-green-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors">
            <Pill size={48} />
            İlaçlarım
          </Link>
        </>
      ) : null}
    </div>
  );
}
