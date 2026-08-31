import React, { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';

const UploadDocument = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR delay
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className='flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-2'>Tıbbi Rapor Yükle</h2>
        <p className='text-base text-zinc-600 dark:text-zinc-400'>
          Raporunuzun fotoğrafını çekin veya yükleyin
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4 w-full'>
        <button
          onClick={handleUpload}
          disabled={isScanning}
          className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-blue-500 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors'
        >
          <Camera className='w-8 h-8 mb-2' />
          <span className='text-base font-medium'>Kamera</span>
        </button>
        <button
          onClick={handleUpload}
          disabled={isScanning}
          className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-blue-500 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors'
        >
          <Upload className='w-8 h-8 mb-2' />
          <span className='text-base font-medium'>Dosya Yükle</span>
        </button>
      </div>

      <div className='h-12 flex items-center justify-center w-full'>
        {isScanning && (
          <div className='flex items-center gap-2 text-blue-600' role='status' aria-live='polite'>
            <Loader2 className='w-5 h-5 animate-spin' />
            <span className='text-base font-medium'>Raporunuz taranıyor...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
