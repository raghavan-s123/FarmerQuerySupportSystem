import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function ExpertDashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [assigned, setAssigned] = useState([]);

  useEffect(() => {
    api.get('/expert/pending').then((res) => setPending(res.data));
    api.get('/expert/assigned').then((res) => setAssigned(res.data));
  }, []);

  return (
    <div>
      <PageHeader title={`Welcome, Dr. ${user.fullName.split(' ')[0]} 👨‍🌾`} subtitle={`Domain: ${user.expertDomain || 'General Agriculture'} — Farmers are waiting for your expertise.`} />
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-value">{pending.length}</div><div className="stat-label">Pending Questions</div></div>
        <div className="stat-card"><div className="stat-value">{assigned.length}</div><div className="stat-label">Your Assigned Queries</div></div>
        <div className="stat-card"><div className="stat-value">{assigned.filter((q) => q.status === 'CLOSED').length}</div><div className="stat-label">Resolved</div></div>
      </div>
      <p className="text-muted">Go to <strong>Farmer Queries</strong> in the sidebar to accept and live-chat with farmers.</p>
    </div>
  );
}
