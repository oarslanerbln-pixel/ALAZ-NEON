"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getMe, logout as apiLogout, ApiError, type AuthUser } from '@/lib/api';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Oturum artık tamamen httpOnly cookie üzerinden yönetiliyor — token'ın
// kendisi JS'e hiç görünmüyor. Bu context yalnızca "kim giriş yapmış"
// bilgisini (id, email) tutuyor; sayfa yüklendiğinde GET /auth/me ile
// cookie'nin geçerli olup olmadığı sorgulanıp bu state hydrate ediliyor.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((newUser: AuthUser) => {
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    // Cookie'yi temizlemek sunucu tarafında yapılmalı (httpOnly — JS silemez).
    // Yanıtı beklemeden yerel state'i hemen temizliyoruz; ağ hatası olsa bile
    // kullanıcı arayüzde çıkış yapmış görünür.
    apiLogout().catch((err) => {
      if (!(err instanceof ApiError)) console.error('Çıkış isteği başarısız:', err);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
