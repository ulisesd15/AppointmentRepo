import { apiRequest } from '../lib/api';

export async function fetchPublicAnnouncements() {
  const data = await apiRequest('/announcements');
  return data.announcements || [];
}
