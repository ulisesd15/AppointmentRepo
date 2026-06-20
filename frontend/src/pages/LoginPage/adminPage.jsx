import Layout from '../../components/Layout.jsx';

export default function LoginPage() {
  return (
    <Layout>
      <section className="card">
        <p className="eyebrow">Account access</p>
        <h1>Login</h1>
        <p>The login UI is in place. Phase 2 will connect this form to JWT auth.</p>
        <form className="form-grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button className="button primary" type="button">Login coming in Phase 2</button>
        </form>
      </section>
    </Layout>
  );
}
