import { useEffect, useState } from 'react';
import { fetchBusinessHours, saveBusinessHours } from '../../services/adminService.js';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function defaultRows() {
  return DAYS.map((day) => ({
    dayOfWeek: day,
    isOpen: !['saturday', 'sunday'].includes(day),
    openTime: '09:00',
    closeTime: '17:00',
  }));
}

function normalizeRows(rows = []) {
  return defaultRows().map((fallback) => {
    const match = rows.find((row) => row.dayOfWeek === fallback.dayOfWeek || row.day === fallback.dayOfWeek);
    return {
      ...fallback,
      ...match,
      dayOfWeek: fallback.dayOfWeek,
      isOpen: match?.isOpen ?? match?.open ?? fallback.isOpen,
      openTime: (match?.openTime || fallback.openTime).slice(0, 5),
      closeTime: (match?.closeTime || fallback.closeTime).slice(0, 5),
    };
  });
}

export default function BusinessHoursPanel() {
  const [rows, setRows] = useState(defaultRows());
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchBusinessHours()
      .then((data) => {
        if (isMounted) setRows(normalizeRows(data));
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Could not load business hours.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateRow(dayOfWeek, patch) {
    setRows((current) => current.map((row) => (
      row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row
    )));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const saved = await saveBusinessHours(rows);
      setRows(normalizeRows(saved));
      setMessage('Business hours saved.');
    } catch (err) {
      setError(err.message || 'Could not save business hours.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card admin-section">
      <p className="eyebrow">Schedule</p>
      <h2>Weekly business hours</h2>
      <p>Set the normal weekly schedule used by the booking availability API.</p>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}
      {loading && <div className="notice">Loading business hours...</div>}

      {!loading && (
        <form className="hours-form" onSubmit={handleSubmit}>
          {rows.map((row) => (
            <div className="hours-row" key={row.dayOfWeek}>
              <strong>{row.dayOfWeek}</strong>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(row.isOpen)}
                  onChange={(event) => updateRow(row.dayOfWeek, { isOpen: event.target.checked })}
                />
                Open
              </label>
              <input
                type="time"
                value={row.openTime}
                disabled={!row.isOpen}
                onChange={(event) => updateRow(row.dayOfWeek, { openTime: event.target.value })}
              />
              <input
                type="time"
                value={row.closeTime}
                disabled={!row.isOpen}
                onChange={(event) => updateRow(row.dayOfWeek, { closeTime: event.target.value })}
              />
            </div>
          ))}

          <button className="button primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save business hours'}
          </button>
        </form>
      )}
    </section>
  );
}
