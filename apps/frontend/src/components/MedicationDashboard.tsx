import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicationDashboard = () => {
  const [medications, setMedications] = useState([
    { id: 1, name: 'Tansiyon İlacı', dosage: 'Sabah - 1 Tablet', taken: false },
    { id: 2, name: 'Şeker İlacı', dosage: 'Öğle - 1 Tablet', taken: false }
  ]);

  const toggleMedication = (id: number) => {
    setMedications(meds => meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className='w-full max-w-md mx-auto p-4 space-y-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>Günlük İlaçlarım</h2>
      </div>

      <div className='space-y-4'>
        {medications.map(med => (
          <motion.div
            key={med.id}
            role='button'
            tabIndex={0}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            className={`p-6 rounded-2xl cursor-pointer transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none flex items-center justify-between ${med.taken ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'} border-2`}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h3 className='text-xl font-bold'>{med.name}</h3>
              <p className='text-base text-zinc-600 dark:text-zinc-400'>{med.dosage}</p>
            </div>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${med.taken ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
              {med.taken && <Check className='w-6 h-6' />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MedicationDashboard;
