const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  taken: boolean;
  lastTakenAt: string | null;
};

export type Document = {
  id: string;
  originalText: string;
  summary: string;
  language: string;
  createdAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getMedications: () => request<Medication[]>('/medications'),
  createMedication: (data: { name: string; dosage: string; timeOfDay: string }) =>
    request<Medication>('/medications', { method: 'POST', body: JSON.stringify(data) }),
  setMedicationTaken: (id: string, taken: boolean) =>
    request<Medication>(`/medications/${id}`, { method: 'PATCH', body: JSON.stringify({ taken }) }),
  deleteMedication: (id: string) =>
    request<void>(`/medications/${id}`, { method: 'DELETE' }),
  createDocument: (originalText: string) =>
    request<Document>('/documents', { method: 'POST', body: JSON.stringify({ originalText }) }),
};
