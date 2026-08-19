"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/"
          aria-label="Geri"
          className="grid place-items-center size-11 rounded-xl bg-navy-800 border border-white/10 hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Giriş Yap</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold text-ink-300">E-posta</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="p-4 rounded-xl bg-navy-800 border border-white/10 text-ink-100 focus-visible:outline-none focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-semibold text-ink-300">Şifre</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="p-4 rounded-xl bg-navy-800 border border-white/10 text-ink-100 focus-visible:outline-none focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 transition-colors"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="bg-coral-500/10 border border-coral-500/40 text-coral-400 p-4 rounded-xl font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-950 p-4 rounded-xl text-xl font-bold transition-colors duration-200 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
        >
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="text-center text-ink-500">
        Hesabınız yok mu?{' '}
        <Link href="/register" className="text-gold-400 font-semibold hover:text-gold-300">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
