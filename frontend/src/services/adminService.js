import { apiRequest } from '../lib/api';

export async function fetchAdminStats() {
  const data = await apiRequest('/admin/dashboard/stats');
  return data.stats;
}

export async function fetchAdminAppointments(params = {}) {
  const query = new URLSearchParams();

  if (params.status) query.set('status', params.status);
  if (params.date) query.set('date', params.date);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await apiRequest(`/admin/appointments${suffix}`);
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
