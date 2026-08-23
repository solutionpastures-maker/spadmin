import { supabase } from '@/lib/supabase';

export async function adminFetch(url: string, init?: RequestInit): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

export async function adminJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function uploadAdminImage(file: File, bucket: string, path: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('bucket', bucket);
  form.append('path', path);
  const res = await adminFetch('/api/upload/image', { method: 'POST', body: form });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !body.url) {
    throw new Error(body.error || 'Upload failed');
  }
  return body.url;
}
