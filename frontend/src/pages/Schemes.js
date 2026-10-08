import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  useEffect(() => { api.get('/schemes').then((res) => setSchemes(res.data)); }, []);

  return (
    <div>
      <PageHeader title="Government Schemes 🏛️" subtitle="Explore schemes, eligibility criteria and required documents." />
      <div className="grid grid-2">
        {schemes.map((s) => (
          <div key={s.id} className="card card-accent-left">
            <h3 className="font-display" style={{ fontSize: 17, marginBottom: 8 }}>{s.schemeName}</h3>
            <p className="text-muted" style={{ marginBottom: 10 }}>{s.description}</p>
            <p style={{ fontSize: 13.5 }}><strong>Eligibility:</strong> {s.eligibility}</p>
            <p style={{ fontSize: 13.5 }}><strong>Documents:</strong> {s.documentsRequired}</p>
          </div>
        ))}
        {schemes.length === 0 && <p className="empty-state">No schemes available yet.</p>}
      </div>
    </div>
  );
}
