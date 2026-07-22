import { getToken, clearToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  taken: boolean;
  lastTakenAt: string | null;
};

export type MedicationCandidate = {
  name: string;
  dosage: string;
  timeOfDay: string;
};

export type Document = {
  id: string;
  originalText: string;
  summary: string;
  language: string;
  createdAt: string;
  suggestedMedications: MedicationCandidate[];
};

export type AuthResult = {
  token: string;
  user: { id: string; email: string };
};

export type Profile = {
  id: string;
  email: string;
  consentAcceptedAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearToken();
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `İstek başarısız oldu (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  register: (email: string, password: string, consentAccepted: boolean) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, consentAccepted }) }),
  login: (email: string, password: string) =>
    request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProfile: () => request<Profile>('/auth/me'),
  deleteAccount: () => request<void>('/auth/me', { method: 'DELETE' }),
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
