import { motion } from "framer-motion";
import { CheckSquare } from "lucide-react";

interface PlayerReviewProps {
  submitStatus: "idle" | "submitting" | "success" | "error";
}

export function PlayerReview({ submitStatus }: PlayerReviewProps) {
  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center text-center p-8 bg-black"
    >
      <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-none flex items-center justify-center mb-10 relative">
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white" />
        <CheckSquare className="w-8 h-8 text-white" strokeWidth={1} />
      </div>
      
      <h2 className="text-2xl font-light text-white tracking-[0.3em] mb-6">
        DEĞERLENDİRME
      </h2>
      
      <p className="text-zinc-500 font-light text-xs max-w-xs mx-auto leading-loose tracking-[0.2em]">
        CEVAPLARINIZ İNCELENİYOR.
        <br />LÜTFEN BEKLEYİN.
      </p>
      
      {submitStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 px-6 py-4 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs tracking-[0.3em] flex items-center gap-3 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
          <div className="w-1.5 h-1.5 bg-green-500 animate-pulse ml-2" />
          VERİ AKTARILDI
        </motion.div>
      )}
    </motion.div>
  );
}
