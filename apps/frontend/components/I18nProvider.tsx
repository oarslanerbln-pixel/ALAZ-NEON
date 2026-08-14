"use client";

import { useEffect } from "react";
import "../i18n"; // Ensure this runs on the client

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only init logic if needed
  }, []);

  return <>{children}</>;
}
