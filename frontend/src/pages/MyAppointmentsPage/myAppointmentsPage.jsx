import Layout from '../../components/Layout.jsx';

export default function MyAppointmentsPage() {
  return (
    <Layout>
      <section className="card">
        <p className="eyebrow">Patient portal</p>
        <h1>My appointments</h1>
        <p>Phase 3 will show booked appointments for the logged-in user and support cancellation.</p>
      </section>
    </Layout>
  );
}
