import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  useEffect(() => { api.get('/admin/experts').then((res) => setExperts(res.data)); }, []);

  return (
    <div>
      <PageHeader title="Experts 👨‍🌾" subtitle="Agriculture experts registered on the platform." />
      <div className="grid grid-3">
        {experts.map((e) => (
          <div key={e.id} className="card">
            <h3 className="font-display" style={{ fontSize: 16 }}>{e.fullName}</h3>
            <p className="text-muted" style={{ fontSize: 13.5 }}>{e.email}</p>
            <p className="text-muted" style={{ fontSize: 13.5 }}>{e.phone}</p>
            {e.expertDomain && <span className="badge badge-blue" style={{ marginTop: 6 }}>{e.expertDomain}</span>}
          </div>
        ))}
        {experts.length === 0 && <p className="empty-state">No experts registered yet.</p>}
      </div>
    </div>
  );
}
