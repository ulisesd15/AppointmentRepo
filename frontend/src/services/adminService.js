import { apiRequest } from '../lib/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString() ? `?${query.toString()}` : '';
}

export async function fetchAdminStats() {
  const data = await apiRequest('/admin/dashboard/stats');
  return data.stats;
}

export async function fetchAdminUsers(params = {}) {
  const data = await apiRequest(`/admin/users${buildQuery(params)}`);
  return data.users || [];
}

export async function updateAdminUser(id, payload) {
  const data = await apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return data.user;
}

export async function verifyAdminUser(id, isVerified = true) {
  const data = await apiRequest(`/admin/users/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ isVerified }),
  });

  return data.user;
}

export async function fetchAdminAppointments(params = {}) {
  const data = await apiRequest(`/admin/appointments${buildQuery(params)}`);
  return data.appointments || [];
}

export async function updateAppointmentStatus(id, status) {
  const data = await apiRequest(`/admin/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  return data.appointment;
}

export async function fetchBusinessHours() {
  const data = await apiRequest('/admin/business-hours');
  return data.businessHours || [];
}

export async function saveBusinessHours(businessHours) {
  const data = await apiRequest('/admin/business-hours', {
    method: 'PUT',
    body: JSON.stringify({ businessHours }),
  });

  return data.businessHours || [];
}

export async function fetchScheduleExceptions() {
  const data = await apiRequest('/admin/schedule-exceptions');
  return data.exceptions || [];
}

export async function createScheduleException(payload) {
  const data = await apiRequest('/admin/schedule-exceptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.exception;
}

export async function updateScheduleException(id, payload) {
  const data = await apiRequest(`/admin/schedule-exceptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return data.exception;
}

export async function fetchBlockedSlots() {
  const data = await apiRequest('/admin/blocked-slots');
  return data.blockedSlots || [];
}

export async function createBlockedSlot(payload) {
  const data = await apiRequest('/admin/blocked-slots', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.blockedSlot;
}

export async function fetchAnnouncements(params = {}) {
  const data = await apiRequest(`/admin/announcements${buildQuery(params)}`);
  return data.announcements || [];
}

export async function createAnnouncement(payload) {
  const data = await apiRequest('/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.announcement;
}

export async function updateAnnouncement(id, payload) {
  const data = await apiRequest(`/admin/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return data.announcement;
}
