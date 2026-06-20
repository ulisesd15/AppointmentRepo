import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import { fetchPublicAnnouncements } from '../../services/announcementService.js';

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetchPublicAnnouncements()
      .then((data) => {
        if (isMounted) setAnnouncements(data);
      })
      .catch(() => {
        if (isMounted) setAnnouncements([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">Quirofísicos Rocha</p>
        <h1>Book chiropractic appointments with Quirofísicos Rocha.</h1>
        <p>
          Schedule a visit, manage your appointments, and stay updated with clinic announcements.
          Guests can book, and registered patients can track appointments from their account.
        </p>
        <div className="actions">
          <Link className="button primary" to="/book">Start booking</Link>
          <Link className="button" to="/login">Login</Link>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="card announcement-section">
          <p className="eyebrow">Clinic updates</p>
          <h2>Announcements</h2>
          <div className="announcement-list">
            {announcements.map((announcement) => (
              <article className="announcement-card" key={announcement.id}>
                <h3>{announcement.title}</h3>
                <p>{announcement.content}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
