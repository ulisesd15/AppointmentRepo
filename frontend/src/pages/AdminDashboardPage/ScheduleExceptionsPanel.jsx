import { useEffect, useState } from 'react';
import {
  createScheduleException,
  fetchScheduleExceptions,
} from '../../services/adminService.js';

const initialForm = {
  title: '',
  exceptionType: 'special_hours',
  startDate: '',
  endDate: '',
  isClosed: false,
  customOpenTime: '09:00',
  customCloseTime: '17:00',
  reason: '',
};

export default function ScheduleExceptionsPanel() {
  const [exceptions, setExceptions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadExceptions() {
    setLoading(true);
    try {
      const data = await fetchScheduleExceptions();
      setExceptions(data);
    } catch (err) {
      setError(err.message || 'Could not load schedule exceptions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExceptions();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await createScheduleException({
        ...form,
        endDate: form.endDate || form.startDate,
      });
      setForm(initialForm);
      setMessage('Schedule exception created.');
      await loadExceptions();
    } catch (err) {
      setError(err.message || 'Could not create schedule exception.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card admin-section">
      <p className="eyebrow">Exceptions</p>
      <h2>Closed days and special hours</h2>
      <p>Create holidays, closure dates, or one-off custom clinic hours.</p>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <form className="admin-mini-form" onSubmit={handleSubmit}>
        <input
          placeholder="Title, e.g. Holiday closure"
          value={form.title}
          onChange={(event) => updateForm('title', event.target.value)}
        />
        <select
          value={form.exceptionType}
          onChange={(event) => updateForm('exceptionType', event.target.value)}
        >
          <option value="special_hours">Special hours</option>
          <option value="holiday">Holiday</option>
          <option value="closure">Closure</option>
        </select>
        <input
          type="date"
          value={form.startDate}
          onChange={(event) => updateForm('startDate', event.target.value)}
          required
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(event) => updateForm('endDate', event.target.value)}
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.isClosed}
            onChange={(event) => updateForm('isClosed', event.target.checked)}
          />
          Closed all day
        </label>
        {!form.isClosed && (
          <>
            <input
              type="time"
              value={form.customOpenTime}
              onChange={(event) => updateForm('customOpenTime', event.target.value)}
            />
            <input
              type="time"
              value={form.customCloseTime}
              onChange={(event) => updateForm('customCloseTime', event.target.value)}
            />
          </>
        )}
        <input
          placeholder="Reason or note"
          value={form.reason}
          onChange={(event) => updateForm('reason', event.target.value)}
        />
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add exception'}
        </button>
      </form>

      {loading ? (
        <div className="notice">Loading exceptions...</div>
      ) : (
        <div className="compact-list">
          {exceptions.slice(0, 6).map((item) => (
            <article key={item.id}>
              <strong>{item.title || item.exceptionType}</strong>
              <span>{item.startDate} to {item.endDate || item.startDate}</span>
              <span>{item.isClosed ? 'Closed' : `${item.customOpenTime || ''} - ${item.customCloseTime || ''}`}</span>
            </article>
          ))}
          {exceptions.length === 0 && <div className="notice">No schedule exceptions yet.</div>}
        </div>
      )}
    </section>
  );
}
