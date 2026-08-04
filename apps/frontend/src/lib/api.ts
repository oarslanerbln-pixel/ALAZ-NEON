const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  taken: boolean;
  lastTakenAt: string | null;
};

export type AuthUser = { id: string; email: string };
export type AuthResponse = { user: AuthUser };

export type ReportDocument = {
  id: string;
  originalText: string;
  summary: string;
  language: string;
  createdAt: string;
};

export class ApiError extends Error {}

// Auth durumu artık httpOnly bir cookie'de tutuluyor (JS'ten erişilemez —
// XSS ile token sızdırma riskine karşı). `credentials: 'include'` her
// istekte bu cookie'nin gönderilmesini/kabul edilmesini sağlıyor; ayrıca
// token parametresi/Authorization header'ı yok artık, tarayıcı hallediyor.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? 'Bir hata oluştu.');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function register(email: string, password: string) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<void>('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return request<AuthResponse>('/auth/me');
}

export function getMedications() {
  return request<Medication[]>('/medications');
}

export function addMedication(data: { name: string; dosage: string; timeOfDay: string }) {
  return request<Medication>('/medications', { method: 'POST', body: JSON.stringify(data) });
}

export function toggleMedication(id: string, taken: boolean) {
  return request<Medication>(`/medications/${id}`, { method: 'PATCH', body: JSON.stringify({ taken }) });
}

export function deleteMedication(id: string) {
  return request<void>(`/medications/${id}`, { method: 'DELETE' });
}

export function createDocument(originalText: string) {
  return request<ReportDocument>('/documents', { method: 'POST', body: JSON.stringify({ originalText }) });
}
