"use client";

import { t } from "@/lib/i18n";

export function Disclaimer() {
  return (
    <div className="w-full bg-background border-t-2 border-foreground p-4 text-center mt-auto">
      <p className="text-sm font-bold text-foreground">
        ⚠️ {t("disclaimer")}
      </p>
    </div>
  );
}
