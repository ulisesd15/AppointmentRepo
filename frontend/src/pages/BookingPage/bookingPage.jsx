import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createAppointment, fetchAvailableSlots } from '../../services/appointmentService.js';

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  note: '',
};

export default function BookingPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availability, setAvailability] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [form, setForm] = useState(initialForm);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        fullName: current.fullName || user.fullName || '',
        email: current.email || user.email || '',
        phone: current.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    let isCurrent = true;

    async function loadSlots() {
      setIsLoadingSlots(true);
      setError(null);
      setMessage(null);
      setSelectedTime('');

      try {
        const data = await fetchAvailableSlots(selectedDate);
        if (isCurrent) setAvailability(data);
      } catch (slotError) {
        if (isCurrent) {
          setAvailability(null);
          setError(slotError.message);
        }
      } finally {
        if (isCurrent) setIsLoadingSlots(false);
      }
    }

    loadSlots();

    return () => {
      isCurrent = false;
    };
  }, [selectedDate]);

  const availableSlots = useMemo(
    () => availability?.slots?.filter((slot) => slot.available) || [],
    [availability]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const appointment = await createAppointment({
        ...form,
        date: selectedDate,
        time: selectedTime,
      });

      setMessage(
        `Appointment requested for ${selectedDate} at ${appointment.displayTime}. It is currently ${appointment.status}.`
      );
      setSelectedTime('');
      setForm((current) => ({
        ...current,
        note: '',
      }));
      const refreshedAvailability = await fetchAvailableSlots(selectedDate);
      setAvailability(refreshedAvailability);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="card booking-card">
        <p className="eyebrow">Appointments</p>
        <h1>Book an appointment</h1>
        <p>
          Choose a date, select an available time, and send your appointment request. Logged-in
          patients can view and cancel their appointments from the patient portal.
        </p>

        {!isAuthenticated && (
          <div className="notice">
            You can book as a guest, but creating an account lets you track and cancel your own
            appointments later.
          </div>
        )}

        {error && <div className="notice error">{error}</div>}
        {message && <div className="notice success">{message}</div>}

        <form className="booking-layout" onSubmit={handleSubmit}>
          <div className="booking-panel">
            <div className="field">
              <label htmlFor="appointment-date">Appointment date</label>
              <input
                id="appointment-date"
                type="date"
                min={getTodayDateString()}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                required
              />
            </div>

            <h2>Available times</h2>
            {isLoadingSlots ? (
              <p>Loading available times...</p>
            ) : !availability?.isOpen ? (
              <div className="notice error">{availability?.reason || 'No availability for this date.'}</div>
            ) : availableSlots.length === 0 ? (
              <div className="notice">No open slots left for this date. Try another day.</div>
            ) : (
              <div className="slot-grid">
                {availability.slots.map((slot) => (
                  <button
                    className={`slot-button ${selectedTime === slot.time ? 'selected' : ''}`}
                    disabled={!slot.available}
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    type="button"
                    title={slot.reason || 'Available'}
                  >
                    {slot.displayTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="booking-panel">
            <h2>Patient details</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="note">Reason for visit</label>
                <textarea
                  id="note"
                  name="note"
                  rows="4"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Optional notes for the clinic"
                />
              </div>

              <button className="button primary" disabled={!selectedTime || isSubmitting} type="submit">
                {isSubmitting ? 'Requesting...' : 'Request appointment'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </Layout>
  );
}
