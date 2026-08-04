"use client";

import { useEffect } from 'react';

/**
 * Registers the app-shell service worker (`public/sw.js`) on mount. No UI — this
 * component only exists to run the registration side effect once, app-wide.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker kaydı başarısız oldu:', err);
      });
    }
  }, []);

  return null;
}
