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
export type AuthResponse = { token: string; user: AuthUser };

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export function getMedications(token: string) {
  return request<Medication[]>('/medications', {}, token);
}

export function addMedication(token: string, data: { name: string; dosage: string; timeOfDay: string }) {
  return request<Medication>('/medications', { method: 'POST', body: JSON.stringify(data) }, token);
}

export function toggleMedication(token: string, id: string, taken: boolean) {
  return request<Medication>(`/medications/${id}`, { method: 'PATCH', body: JSON.stringify({ taken }) }, token);
}

export function deleteMedication(token: string, id: string) {
  return request<void>(`/medications/${id}`, { method: 'DELETE' }, token);
}
