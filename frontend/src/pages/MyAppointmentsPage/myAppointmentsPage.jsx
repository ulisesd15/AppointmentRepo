import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import { cancelAppointment, fetchMyAppointments } from '../../services/appointmentService.js';

function formatDate(value) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  async function loadAppointments() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMyAppointments();
      setAppointments(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleCancel(id) {
    setCancellingId(id);
    setError(null);
    setMessage(null);

    try {
      const updatedAppointment = await cancelAppointment(id);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      );
      setMessage('Appointment cancelled.');
    } catch (cancelError) {
      setError(cancelError.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <Layout>
      <section className="card">
        <p className="eyebrow">Patient portal</p>
        <h1>My appointments</h1>
        <p>Review your appointment requests and cancel upcoming appointments when needed.</p>

        {error && <div className="notice error">{error}</div>}
        {message && <div className="notice success">{message}</div>}

        {isLoading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="notice">You do not have any appointments yet.</div>
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <article className="appointment-card" key={appointment.id}>
                <div>
                  <p className="eyebrow">{appointment.status}</p>
                  <h2>{formatDate(appointment.date)}</h2>
                  <p>
                    {appointment.displayTime} · {appointment.fullName}
                  </p>
                  {appointment.note && <p>{appointment.note}</p>}
                </div>

                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <button
                    className="button"
                    disabled={cancellingId === appointment.id}
                    onClick={() => handleCancel(appointment.id)}
                    type="button"
                  >
                    {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
