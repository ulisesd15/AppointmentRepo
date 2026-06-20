import Layout from '../../components/Layout.jsx';
import AdminAppointmentsPanel from './AdminAppointmentsPanel.jsx';
import AdminStatsPanel from './AdminStatsPanel.jsx';
import BusinessHoursPanel from './BusinessHoursPanel.jsx';
import './adminDashboard.css';

export default function AdminDashboardPage() {
  return (
    <Layout>
      <section className="card admin-hero">
        <p className="eyebrow">Clinic admin</p>
        <h1>Admin dashboard</h1>
        <p>
          Manage appointments and the weekly schedule from one place. Exceptions,
          blocked slots, users, and announcements are ready in the API and can be expanded in the next UI pass.
        </p>
        <AdminStatsPanel />
      </section>

      <AdminAppointmentsPanel />
      <BusinessHoursPanel />
    </Layout>
  );
}
