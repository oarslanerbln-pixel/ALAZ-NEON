"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, ReactNode } from 'react';
import type { AuthUser } from '@/lib/api';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
};

type Session = { token: string | null; user: AuthUser | null };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'medisade_token';
const USER_KEY = 'medisade_user';

const EMPTY_SESSION: Session = { token: null, user: null };

const listeners = new Set<() => void>();
let cachedSession: Session | null = null;

function readSessionFromStorage(): Session {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    return EMPTY_SESSION;
  }

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return EMPTY_SESSION;
  }
}

function getSnapshot(): Session {
  if (cachedSession === null) {
    cachedSession = readSessionFromStorage();
  }
  return cachedSession;
}

function getServerSnapshot(): Session {
  return EMPTY_SESSION;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeSession(session: Session) {
  if (session.token && session.user) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  cachedSession = session;
  listeners.forEach((listener) => listener());
}

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hasHydrated = useHasHydrated();

  const signIn = useCallback((newToken: string, newUser: AuthUser) => {
    writeSession({ token: newToken, user: newUser });
  }, []);

  const signOut = useCallback(() => {
    writeSession(EMPTY_SESSION);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...session, isLoading: !hasHydrated, signIn, signOut }),
    [session, hasHydrated, signIn, signOut]
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
