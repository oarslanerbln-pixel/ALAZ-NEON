"use client";

import Link from 'next/link';
import { Camera, Pill, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[70vh] animate-fade-up">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Netçe&apos;ye Hoşgeldiniz</h1>
        {!isLoading && user && (
          <p className="text-ink-500 mt-2">{user.email} olarak giriş yaptınız</p>
        )}
      </div>

      <Link
        href="/scan"
        className="group w-full flex items-center gap-5 bg-navy-800 hover:bg-navy-700 p-6 rounded-2xl text-xl font-semibold transition-all duration-200 border border-white/10 hover:border-gold-500/40 shadow-lg shadow-black/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        <span className="shrink-0 grid place-items-center size-14 rounded-xl bg-gold-500/15 text-gold-400 group-hover:bg-gold-500/25 transition-colors">
          <Camera size={28} />
        </span>
        <span className="flex flex-col items-start gap-0.5">
          Rapor Tara
          <span className="text-sm font-normal text-ink-500">Raporunuzu tarayın, sade dilde okuyun</span>
        </span>
      </Link>

      <Link
        href="/medications"
        className="group w-full flex items-center gap-5 bg-navy-800 hover:bg-navy-700 p-6 rounded-2xl text-xl font-semibold transition-all duration-200 border border-white/10 hover:border-gold-500/40 shadow-lg shadow-black/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        <span className="shrink-0 grid place-items-center size-14 rounded-xl bg-sage-500/15 text-sage-400 group-hover:bg-sage-500/25 transition-colors">
          <Pill size={28} />
        </span>
        <span className="flex flex-col items-start gap-0.5">
          İlaçlarım
          <span className="text-sm font-normal text-ink-500">Dozlarınızı takip edin</span>
        </span>
      </Link>

      {!isLoading && !user && (
        <div className="w-full flex flex-col gap-3 mt-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-3 bg-transparent hover:bg-navy-800 text-ink-100 p-4 rounded-xl text-lg font-semibold transition-colors duration-200 border border-white/15 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <LogIn size={22} />
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-3 bg-gold-500 hover:bg-gold-400 text-navy-950 p-4 rounded-xl text-lg font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            <UserPlus size={22} />
            Kayıt Ol
          </Link>
        </div>
      )}

      {!isLoading && user && (
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-3 bg-transparent hover:bg-coral-500/10 text-ink-300 hover:text-coral-400 p-4 rounded-xl text-lg font-semibold transition-colors duration-200 border border-white/10 hover:border-coral-500/30 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400"
        >
          <LogOut size={22} />
          Çıkış Yap
        </button>
      )}
    </div>
  );
}
