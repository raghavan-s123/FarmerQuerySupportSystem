import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const load = () => api.get('/admin/users').then((res) => setUsers(res.data));
  useEffect(() => { load(); }, []);

  const removeUser = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader title="Users 👥" subtitle="All registered users on the platform." />
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 13 }}>
              <th style={{ padding: 8 }}>Name</th><th>Email</th><th>Role</th><th>Language</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: 8 }}>{u.fullName}</td>
                <td>{u.email}</td>
                <td><span className="badge badge-green">{u.role}</span></td>
                <td>{u.preferredLanguage}</td>
                <td><button className="btn btn-outline" onClick={() => removeUser(u.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
