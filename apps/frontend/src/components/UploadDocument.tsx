'use client';
export function UploadDocument() {
  return (
    <div className="p-4 border-2 border-yellow-400 my-4 text-center">
      <button className="interactive border-2 p-2 text-lg w-full">Upload Report / Kamerayı Aç</button>
      <p className="mt-2 text-xl font-bold animate-pulse">Raporunuz taranıyor...</p>
    </div>
  );
}