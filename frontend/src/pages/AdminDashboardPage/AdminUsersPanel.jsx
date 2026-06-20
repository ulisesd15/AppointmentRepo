import { useEffect, useState } from 'react';
import {
  fetchAdminUsers,
  updateAdminUser,
  verifyAdminUser,
} from '../../services/adminService.js';

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchAdminUsers({ search, role });
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(userId, nextRole) {
    setSavingId(userId);
    setError('');

    try {
      await updateAdminUser(userId, { role: nextRole });
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Could not update user role.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleVerify(userId, isVerified) {
    setSavingId(userId);
    setError('');

    try {
      await verifyAdminUser(userId, isVerified);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Could not update verification.');
    } finally {
      setSavingId(null);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadUsers();
  }

  return (
    <section className="card admin-section">
      <div className="admin-section-header">
        <div>
          <p className="eyebrow">Users</p>
          <h2>User management</h2>
          <p>Search patients, verify accounts, and promote or demote admins.</p>
        </div>
      </div>

      <form className="admin-filter-row" onSubmit={handleSubmit}>
        <input
          placeholder="Search name, email, or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <button className="button" type="submit">Search</button>
      </form>

      {error && <div className="notice error">{error}</div>}
      {loading && <div className="notice">Loading users...</div>}

      {!loading && users.length === 0 && <div className="notice">No users found.</div>}

      {!loading && users.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                    <span>{user.phone || 'No phone'}</span>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      disabled={savingId === user.id}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="button small"
                      type="button"
                      disabled={savingId === user.id}
                      onClick={() => handleVerify(user.id, !user.isVerified)}
                    >
                      {user.isVerified ? 'Verified' : 'Mark verified'}
                    </button>
                  </td>
                  <td>{String(user.createdAt || '').slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
