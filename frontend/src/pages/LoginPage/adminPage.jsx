import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const initialLoginState = {
  email: '',
  password: '',
};

const initialRegisterState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/appointments';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(loginForm);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(registerForm);
      navigate('/appointments', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="card auth-card">
        <p className="eyebrow">Account access</p>
        <h1>{mode === 'login' ? 'Login' : 'Create account'}</h1>
        <p>
          Sign in to view appointments. Create a patient account before booking if you want appointment history tied to your profile.
        </p>

        <div className="segmented-control" role="tablist" aria-label="Choose auth mode">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        {error && <div className="notice error">{error}</div>}

        {mode === 'login' ? (
          <form className="form-grid" onSubmit={handleLoginSubmit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((form) => ({ ...form, email: event.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((form) => ({ ...form, password: event.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegisterSubmit}>
            <div className="field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                value={registerForm.fullName}
                onChange={(event) => setRegisterForm((form) => ({ ...form, fullName: event.target.value }))}
                placeholder="Patient name"
                autoComplete="name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm((form) => ({ ...form, email: event.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-phone">Phone</label>
              <input
                id="register-phone"
                type="tel"
                value={registerForm.phone}
                onChange={(event) => setRegisterForm((form) => ({ ...form, phone: event.target.value }))}
                placeholder="Optional"
                autoComplete="tel"
              />
            </div>
            <div className="field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((form) => ({ ...form, password: event.target.value }))}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}
      </section>
    </Layout>
  );
}
