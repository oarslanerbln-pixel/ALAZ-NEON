"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { user } = await login(email, password);
      signIn(user);
      router.push('/medications');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
        <h1 className="text-2xl font-bold">Giriş Yap</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-bold text-gray-300">E-posta</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="p-4 rounded-none bg-[#0a0a0a] border-2 border-gray-800 focus-visible:outline-none focus-visible:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-bold text-gray-300">Şifre</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="p-4 rounded-none bg-[#0a0a0a] border-2 border-gray-800 focus-visible:outline-none focus-visible:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-none">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-4 rounded-none text-xl font-bold transition-all animate-glow-pulse border border-blue-400/20"
        >
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="text-center text-gray-300">
        Hesabınız yok mu?{' '}
        <Link href="/register" className="text-blue-400 font-bold">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
