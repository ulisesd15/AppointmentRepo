import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/" className="brand">
            <strong>Quirofísicos Rocha</strong>
            <span>Appointments and clinic management</span>
          </Link>
          <div className="nav-links">
            <Link to="/book">Book</Link>
            <Link to="/appointments">My Appointments</Link>
            <Link to="/login">Login</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </nav>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
