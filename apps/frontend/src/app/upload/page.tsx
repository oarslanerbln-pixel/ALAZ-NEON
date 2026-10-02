import UploadDocument from "@/components/UploadDocument";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-gray-800 text-yellow-400 font-bold rounded-lg border-2 border-yellow-400 hover:bg-gray-700 focus-visible-ring"
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>
      <UploadDocument />
    </div>
  );
}
