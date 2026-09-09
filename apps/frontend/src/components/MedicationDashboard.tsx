'use client';
export function MedicationDashboard() {
  return (
    <div className="p-4 border-2 border-yellow-400 my-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Günlük İlaçlarınız</h2>
      <button className="interactive border-4 border-cyan-400 p-4 text-3xl font-bold w-full rounded-xl" aria-label="İlacı Alındı Olarak İşaretle">Alındı</button>
    </div>
  );
}