import { useEffect, useState } from 'react';
import {
  fetchAdminAppointments,
  updateAppointmentStatus,
} from '../../services/adminService.js';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

function formatAppointment(appointment) {
  const date = appointment.appointmentDate || appointment.date;
  const time = appointment.appointmentTime || appointment.time;
  return [date, time].filter(Boolean).join(' at ');
}

export default function AdminAppointmentsPanel() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadAppointments() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchAdminAppointments({ status: statusFilter });
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  async function handleStatusChange(appointmentId, nextStatus) {
    setSavingId(appointmentId);
    setError('');

    try {
      await updateAppointmentStatus(appointmentId, nextStatus);
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Could not update appointment status.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="card admin-section">
      <div className="admin-section-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>Review bookings</h2>
        </div>
        <label className="field inline-field">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((status) => (
              <option value={status} key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="notice error">{error}</div>}
      {loading && <div className="notice">Loading appointments...</div>}

      {!loading && appointments.length === 0 && (
        <div className="notice">No appointments match this filter yet.</div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>When</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <strong>{appointment.patientName || appointment.name || 'Patient'}</strong>
                    <span>{appointment.patientEmail || appointment.email}</span>
                    <span>{appointment.patientPhone || appointment.phone}</span>
                  </td>
                  <td>{formatAppointment(appointment)}</td>
                  <td><span className="status-pill">{appointment.status}</span></td>
                  <td>
                    <select
                      value={appointment.status || 'pending'}
                      disabled={savingId === appointment.id}
                      onChange={(event) => handleStatusChange(appointment.id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option value={status} key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
