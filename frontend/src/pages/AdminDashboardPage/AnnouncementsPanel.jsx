import { useEffect, useState } from 'react';
import {
  createAnnouncement,
  fetchAnnouncements,
  updateAnnouncement,
} from '../../services/adminService.js';

const initialForm = {
  title: '',
  content: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);

  async function loadAnnouncements() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Could not load announcements.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
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
      await createAnnouncement({
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      });
      setForm(initialForm);
      setMessage('Announcement created.');
      await loadAnnouncements();
    } catch (err) {
      setError(err.message || 'Could not create announcement.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(announcement) {
    setSavingId(announcement.id);
    setError('');
    setMessage('');

    try {
      await updateAnnouncement(announcement.id, { isActive: !announcement.isActive });
      await loadAnnouncements();
    } catch (err) {
      setError(err.message || 'Could not update announcement.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="card admin-section">
      <p className="eyebrow">Announcements</p>
      <h2>Clinic announcements</h2>
      <p>Create public messages for holidays, schedule changes, or clinic updates.</p>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <form className="admin-mini-form" onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(event) => updateForm('title', event.target.value)}
          required
        />
        <textarea
          placeholder="Announcement content"
          value={form.content}
          onChange={(event) => updateForm('content', event.target.value)}
          required
          rows="3"
        />
        <input
          type="date"
          value={form.startDate}
          onChange={(event) => updateForm('startDate', event.target.value)}
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(event) => updateForm('endDate', event.target.value)}
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateForm('isActive', event.target.checked)}
          />
          Active
        </label>
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create announcement'}
        </button>
      </form>

      {loading ? (
        <div className="notice">Loading announcements...</div>
      ) : (
        <div className="compact-list">
          {announcements.slice(0, 6).map((announcement) => (
            <article key={announcement.id}>
              <strong>{announcement.title}</strong>
              <span>{announcement.content}</span>
              <span>{announcement.isActive ? 'Active' : 'Inactive'}</span>
              <button
                className="button small"
                type="button"
                disabled={savingId === announcement.id}
                onClick={() => handleToggle(announcement)}
              >
                {announcement.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </article>
          ))}
          {announcements.length === 0 && <div className="notice">No announcements yet.</div>}
        </div>
      )}
    </section>
  );
}
