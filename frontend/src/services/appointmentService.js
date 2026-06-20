import { apiRequest } from '../lib/api';

export async function fetchAvailableSlots(date) {
  return apiRequest(`/schedule/available-slots/${date}`);
}

export async function createAppointment(payload) {
  const data = await apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.appointment;
}

export async function fetchMyAppointments() {
  const data = await apiRequest('/appointments/my-appointments');
  return data.appointments || [];
}

export async function cancelAppointment(id) {
  const data = await apiRequest(`/appointments/${id}/cancel`, {
    method: 'PUT',
  });

  return data.appointment;
}
