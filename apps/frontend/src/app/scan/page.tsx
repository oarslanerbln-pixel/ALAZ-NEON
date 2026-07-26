"use client";

import UploadDocument from "@/components/UploadDocument";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rapor Tarama</h1>
      <p className="text-xl">
        Tıbbi raporunuzun fotoğrafını çekin veya yükleyin. Sizin için sadeleştireceğiz.
      </p>

      <UploadDocument />
    </div>
  );
}
