import Layout from '../../components/Layout.jsx';
import AdminAppointmentsPanel from './AdminAppointmentsPanel.jsx';
import AdminStatsPanel from './AdminStatsPanel.jsx';
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
          Manage appointments, weekly business hours, special closures, and blocked appointment times.
          Users and announcements can be added in the next parity pass.
        </p>
        <AdminStatsPanel />
      </section>

      <AdminAppointmentsPanel />
      <BusinessHoursPanel />
      <div className="admin-two-column">
        <ScheduleExceptionsPanel />
        <BlockedSlotsPanel />
      </div>
    </Layout>
  );
}
