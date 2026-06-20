import Layout from '../../components/Layout.jsx';

export default function BookingPage() {
  return (
    <Layout>
      <section className="card">
        <p className="eyebrow">Appointments</p>
        <h1>Book an appointment</h1>
        <p>
          The booking page is routed correctly. Phase 3 will add available slots, patient
          details, and appointment submission.
        </p>
        <div className="notice">Calendar and availability API integration coming next.</div>
      </section>
    </Layout>
  );
}
