import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';

export default function HomePage() {
  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">Rebuild foundation</p>
        <h1>Book chiropractic appointments with Quirofísicos Rocha.</h1>
        <p>
          This page is now wired into the React app. The next phases will connect real auth,
          availability, appointment booking, and admin management.
        </p>
        <div className="actions">
          <Link className="button primary" to="/book">Start booking</Link>
          <Link className="button" to="/login">Login</Link>
        </div>
      </section>
    </Layout>
  );
}
