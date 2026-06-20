const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/$/, '');
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('qr_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
