"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountView />
    </AuthGuard>
  );
}

function AccountView() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then(profile => setEmail(profile.email))
      .catch(() => setError('Profil yüklenemedi.'));
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      clearToken();
      router.push('/');
    } catch {
      setError('Hesap silinemedi. Lütfen tekrar deneyin.');
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
        <h1 className="text-2xl font-bold">Hesabım</h1>
      </div>

      {email ? (
        <p className="text-gray-300">Giriş yapılan hesap: <span className="font-bold">{email}</span></p>
      ) : (
        <div className="flex items-center gap-2 text-gray-300">
          <Loader2 size={20} className="animate-spin" /> Yükleniyor...
        </div>
      )}

      <Link href="/kvkk" className="text-blue-400 font-bold w-fit">KVKK Aydınlatma Metni&apos;ni görüntüle</Link>

      {error && <p className="text-red-400" role="alert">{error}</p>}

      <div className="mt-8 p-6 bg-red-950 border-2 border-red-800 rounded-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold text-red-400">Tehlikeli Bölge</h2>
        <p className="text-gray-300">
          Hesabını sildiğinde tüm ilaçların, tarama geçmişin ve profil bilgilerin
          kalıcı olarak silinir. Bu işlem geri alınamaz.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center justify-center gap-2 p-3 bg-red-700 hover:bg-red-800 rounded-lg font-bold transition-colors"
          >
            <Trash2 size={20} />
            Hesabımı ve Verilerimi Sil
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-bold">Emin misin? Bu geri alınamaz.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 rounded-lg font-bold transition-colors"
              >
                {deleting && <Loader2 size={20} className="animate-spin" />}
                Evet, Kalıcı Olarak Sil
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
