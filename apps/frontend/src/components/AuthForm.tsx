"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

type Mode = 'login' | 'register';

const COPY: Record<Mode, { title: string; cta: string; switchText: string; switchHref: string; switchLabel: string }> = {
  login: {
    title: 'Giriş Yap',
    cta: 'Giriş Yap',
    switchText: 'Hesabın yok mu?',
    switchHref: '/register',
    switchLabel: 'Kayıt ol',
  },
  register: {
    title: 'Kayıt Ol',
    cta: 'Kayıt Ol',
    switchText: 'Zaten hesabın var mı?',
    switchHref: '/login',
    switchLabel: 'Giriş yap',
  },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const copy = COPY[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = mode === 'login'
        ? await api.login(email, password)
        : await api.register(email, password, consentAccepted);
      setToken(result.token);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto w-full mt-12">
      <h1 className="text-3xl font-bold text-center">{copy.title}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-gray-300">E-posta</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-gray-300">Şifre</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
            className="p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {mode === 'register' && (
          <label className="flex items-start gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={e => setConsentAccepted(e.target.checked)}
              required
              className="mt-1 h-5 w-5 accent-blue-600 shrink-0"
            />
            <span>
              <Link href="/kvkk" className="text-blue-400 font-bold">KVKK Aydınlatma Metni</Link>&apos;ni
              okudum, sağlık verilerimin işlenmesine açık rıza veriyorum.
            </span>
          </label>
        )}

        {error && <p className="text-red-400" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={submitting || (mode === 'register' && !consentAccepted)}
          className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-bold transition-colors"
        >
          {submitting && <Loader2 size={20} className="animate-spin" />}
          {copy.cta}
        </button>
      </form>

      <p className="text-center text-gray-400">
        {copy.switchText}{' '}
        <Link href={copy.switchHref} className="text-blue-400 font-bold">{copy.switchLabel}</Link>
      </p>
    </div>
  );
}
