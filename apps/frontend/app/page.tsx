"use client";
import { useState } from "react";
import UploadDocument from "@/components/UploadDocument";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Home() {
  const [taken, setTaken] = useState(false);

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto flex flex-col gap-12">
      <main className="flex flex-col gap-12">
        <section aria-labelledby="medication-heading">
          <h1 id="medication-heading" className="text-3xl font-bold mb-6 border-b-2 pb-2 border-foreground">
            Günlük İlaçlarınız
          </h1>

          <div className="bg-background border-4 border-foreground p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,0,1)]">
            <h2 className="text-2xl font-bold mb-2">Tansiyon İlacı (10mg)</h2>
            <p className="text-xl mb-6">Sabah 09:00 - Tok Karnına</p>

            <motion.div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTaken(!taken);
                }
              }}
              onClick={() => setTaken(!taken)}
              className={`
                w-full p-6 flex items-center justify-center gap-4 text-2xl font-bold rounded-xl border-4 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer
                ${taken
                  ? "bg-green-600 text-white border-green-800"
                  : "bg-foreground text-background border-transparent hover:bg-opacity-90"}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {taken && <Check size={32} className="text-white" />}
              {taken ? "İlaç Alındı" : "İlacı Aldım"}
            </motion.div>
          </div>
        </section>

        <section aria-labelledby="ocr-heading" className="border-t-4 border-foreground pt-12">
          <h1 id="ocr-heading" className="text-3xl font-bold mb-6 border-b-2 pb-2 border-foreground">
            Tıbbi Evrak Yükle
          </h1>
          <UploadDocument />
        </section>
      </main>
    </div>
  );
}
