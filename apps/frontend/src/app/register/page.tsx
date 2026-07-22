"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
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
      const { token, user } = await register(email, password);
      signIn(token, user);
      router.push('/medications');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
        <h1 className="text-2xl font-bold">Kayıt Ol</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-bold">E-posta</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="p-4 rounded-xl bg-gray-800 border-2 border-gray-600 focus-visible:outline-none focus-visible:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-bold">Şifre</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-describedby="password-hint"
            className="p-4 rounded-xl bg-gray-800 border-2 border-gray-600 focus-visible:outline-none focus-visible:border-blue-500"
          />
          <p id="password-hint" className="text-gray-400 text-sm">En az 8 karakter olmalı.</p>
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="text-red-400 font-bold">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-4 rounded-xl text-xl font-bold transition-colors"
        >
          {isSubmitting ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="text-center text-gray-300">
        Zaten hesabınız var mı?{' '}
        <Link href="/login" className="text-blue-400 font-bold">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
