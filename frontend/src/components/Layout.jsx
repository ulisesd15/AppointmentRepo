import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/" className="brand">
            <strong>Quirofísicos Rocha</strong>
            <span>Appointments and clinic management</span>
          </Link>
          <div className="nav-links">
            <NavLink to="/book">Book</NavLink>
            {isAuthenticated && <NavLink to="/appointments">My Appointments</NavLink>}
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            {isAuthenticated ? (
              <button className="nav-button" type="button" onClick={logout}>
                Logout{user?.fullName ? ` (${user.fullName.split(' ')[0]})` : ''}
              </button>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </div>
        </nav>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
