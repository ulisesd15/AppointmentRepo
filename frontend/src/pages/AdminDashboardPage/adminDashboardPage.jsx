import Layout from '../../components/Layout.jsx';
import AdminAppointmentsPanel from './AdminAppointmentsPanel.jsx';
import AdminStatsPanel from './AdminStatsPanel.jsx';
import AdminUsersPanel from './AdminUsersPanel.jsx';
import AnnouncementsPanel from './AnnouncementsPanel.jsx';
import BlockedSlotsPanel from './BlockedSlotsPanel.jsx';
import BusinessHoursPanel from './BusinessHoursPanel.jsx';
import ScheduleExceptionsPanel from './ScheduleExceptionsPanel.jsx';
import './adminDashboard.css';

export default function AdminDashboardPage() {
  return (
    <Layout>
      <section className="card admin-hero">
        <p className="eyebrow">Clinic admin</p>
        <h1>Admin dashboard</h1>
        <p>
          Manage appointments, users, announcements, weekly business hours, special closures,
          and blocked appointment times from one place.
        </p>
        <AdminStatsPanel />
      </section>

      <AdminAppointmentsPanel />
      <AdminUsersPanel />
      <BusinessHoursPanel />
      <div className="admin-two-column">
        <ScheduleExceptionsPanel />
        <BlockedSlotsPanel />
      </div>
      <AnnouncementsPanel />
    </Layout>
  );
}
