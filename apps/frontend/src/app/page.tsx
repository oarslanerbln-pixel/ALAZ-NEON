"use client";

import Link from 'next/link';
import { Camera, Pill, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-2 text-center">MediSade&apos;ye Hoşgeldiniz</h1>

      {!isLoading && user && (
        <p className="text-gray-300 text-center">{user.email} olarak giriş yaptınız</p>
      )}

      <Link href="/scan" className="w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">
        <Camera size={48} />
        Rapor Tara
      </Link>

      <Link href="/medications" className="w-full flex items-center justify-center gap-4 bg-green-600 hover:bg-green-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">
        <Pill size={48} />
        İlaçlarım
      </Link>

      {!isLoading && !user && (
        <div className="w-full flex flex-col gap-4 mt-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl text-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <LogIn size={24} />
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl text-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <UserPlus size={24} />
            Kayıt Ol
          </Link>
        </div>
      )}

      {!isLoading && user && (
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl text-lg font-bold transition-colors mt-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
        >
          <LogOut size={24} />
          Çıkış Yap
        </button>
      )}
    </div>
  );
}
