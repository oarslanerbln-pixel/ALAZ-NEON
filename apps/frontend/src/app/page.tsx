"use client";

import Link from 'next/link';
import { Camera, Pill, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-2 text-center">Netçe&apos;ye Hoşgeldiniz</h1>

      {!isLoading && user && (
        <p className="text-gray-300 text-center">{user.email} olarak giriş yaptınız</p>
      )}

      <Link href="/scan" className="w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-500 text-white p-8 rounded-none text-2xl font-bold transition-all animate-glow-pulse hover:scale-[1.02] border border-blue-400/20">
        <Camera size={48} />
        Rapor Tara
      </Link>

      <Link href="/medications" className="w-full flex items-center justify-center gap-4 bg-green-600 hover:bg-green-500 text-white p-8 rounded-none text-2xl font-bold transition-all animate-glow-pulse-green hover:scale-[1.02] border border-green-400/20">
        <Pill size={48} />
        İlaçlarım
      </Link>

      {!isLoading && !user && (
        <div className="w-full flex flex-col gap-4 mt-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-none text-lg font-bold transition-all animate-glow-pulse-dark hover:scale-[1.02] border border-gray-600/30"
          >
            <LogIn size={24} />
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-none text-lg font-bold transition-all animate-glow-pulse-dark hover:scale-[1.02] border border-gray-600/30"
          >
            <UserPlus size={24} />
            Kayıt Ol
          </Link>
        </div>
      )}

      {!isLoading && user && (
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-none text-lg font-bold transition-all border border-red-900/30 hover:border-red-500/50 hover:text-red-400 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <LogOut size={24} />
          Çıkış Yap
        </button>
      )}
    </div>
  );
}
