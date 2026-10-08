import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const load = () => api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await api.post(`/notifications/${id}/read`); load(); };
  const typeBadge = (type) => ({ WEATHER: 'blue', DISEASE: 'red', PRICE: 'yellow', GENERAL: 'green' }[type] || 'green');

  return (
    <div>
      <PageHeader title="Notifications 🔔" subtitle="Weather, disease and price alerts." />
      <div className="card">
        {notifications.map((n) => (
          <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border)', opacity: n.read ? 0.6 : 1 }}>
            <div>
              <span className={`badge badge-${typeBadge(n.type)}`}>{n.type}</span>
              <p style={{ marginTop: 6, fontWeight: 600 }}>{n.title}</p>
              <p className="text-muted" style={{ fontSize: 13.5 }}>{n.message}</p>
            </div>
            {!n.read && <button className="btn btn-outline" onClick={() => markRead(n.id)}>Mark Read</button>}
          </div>
        ))}
        {notifications.length === 0 && <p className="empty-state">No notifications yet.</p>}
      </div>
    </div>
  );
}
