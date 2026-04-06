'use client';

import { useState } from 'react';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Giriş başarısız.');

      setMessage({ type: 'success', text: data.message });
      setEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">MediSade Giriş</h2>

        <p className="text-gray-300 text-lg mb-8 text-center">
          Şifre ezberlemenize gerek yok. E-posta adresinizi girin, size giriş bağlantısı gönderelim.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xl font-bold text-white mb-2">
              E-Posta Adresiniz
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full bg-gray-900 border-2 border-gray-600 rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 outline-none transition-all"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              )}
              <p className={`font-semibold ${message.type === 'success' ? 'text-green-100' : 'text-red-100'}`}>
                {message.text}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white p-4 rounded-xl font-bold text-xl transition-colors outline-none focus:ring-4 focus:ring-yellow-400 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Gönderiliyor...</>
            ) : (
              'Giriş Bağlantısı Gönder'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
