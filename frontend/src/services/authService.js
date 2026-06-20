import { apiRequest } from '../lib/api';

const TOKEN_KEY = 'qr_token';
const USER_KEY = 'qr_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function storeAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(credentials) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  storeAuthSession(data);
  return data;
}

export async function register(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  storeAuthSession(data);
  return data;
}

export async function fetchProfile() {
  const data = await apiRequest('/auth/profile');
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearAuthSession();
  }
}
