import Layout from '../../components/Layout.jsx';

export default function AdminDashboardPage() {
  return (
    <Layout>
      <section className="card">
        <p className="eyebrow">Clinic admin</p>
        <h1>Admin dashboard</h1>
        <p>
          The admin route is now wired. Phase 4 will add dashboard stats, appointment approvals,
          business hours, schedule exceptions, users, and announcements.
        </p>
        <div className="grid">
          <div className="notice">Appointments module</div>
          <div className="notice">Business hours module</div>
          <div className="notice">Users module</div>
        </div>
      </section>
    </Layout>
  );
}
