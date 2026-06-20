import { useEffect, useState } from 'react';
import { fetchAdminStats } from '../../services/adminService.js';

export default function AdminStatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchAdminStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Could not load dashboard stats.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) return <div className="notice error">{error}</div>;
  if (!stats) return <div className="notice">Loading dashboard stats...</div>;

  const cards = [
    ['Total users', stats.totalUsers],
    ['Total appointments', stats.totalAppointments],
    ['Today', stats.todayAppointments],
    ['Pending', stats.pendingAppointments],
  ];

  return (
    <div className="admin-stats-grid">
      {cards.map(([label, value]) => (
        <article className="admin-stat-card" key={label}>
          <span>{label}</span>
          <strong>{value ?? 0}</strong>
        </article>
      ))}
    </div>
  );
}
