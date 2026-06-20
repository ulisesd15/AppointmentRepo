import { useEffect, useState } from 'react';
import { createBlockedSlot, fetchBlockedSlots } from '../../services/adminService.js';

const initialForm = {
  blockDate: '',
  startTime: '09:00',
  endTime: '09:30',
  reason: '',
};

export default function BlockedSlotsPanel() {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadBlockedSlots() {
    setLoading(true);
    try {
      const data = await fetchBlockedSlots();
      setBlockedSlots(data);
    } catch (err) {
      setError(err.message || 'Could not load blocked slots.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlockedSlots();
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
      await createBlockedSlot(form);
      setForm(initialForm);
      setMessage('Blocked slot created.');
      await loadBlockedSlots();
    } catch (err) {
      setError(err.message || 'Could not create blocked slot.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card admin-section">
      <p className="eyebrow">Blocked time</p>
      <h2>Block appointment slots</h2>
      <p>Prevent patients from booking specific times for breaks, meetings, or unavailable periods.</p>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <form className="admin-mini-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={form.blockDate}
          onChange={(event) => updateForm('blockDate', event.target.value)}
          required
        />
        <input
          type="time"
          value={form.startTime}
          onChange={(event) => updateForm('startTime', event.target.value)}
          required
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(event) => updateForm('endTime', event.target.value)}
          required
        />
        <input
          placeholder="Reason"
          value={form.reason}
          onChange={(event) => updateForm('reason', event.target.value)}
        />
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Block slot'}
        </button>
      </form>

      {loading ? (
        <div className="notice">Loading blocked slots...</div>
      ) : (
        <div className="compact-list">
          {blockedSlots.slice(0, 6).map((slot) => (
            <article key={slot.id}>
              <strong>{slot.blockDate}</strong>
              <span>{slot.startTime} - {slot.endTime}</span>
              <span>{slot.reason || 'No reason provided'}</span>
            </article>
          ))}
          {blockedSlots.length === 0 && <div className="notice">No blocked slots yet.</div>}
        </div>
      )}
    </section>
  );
}
