import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  useEffect(() => { api.get('/admin/feedback').then((res) => setFeedback(res.data)); }, []);

  return (
    <div>
      <PageHeader title="Feedback 📩" subtitle="Messages submitted by users." />
      <div className="card">
        {feedback.map((f) => (
          <div key={f.id} style={{ padding: '12px 0', borderTop: '1px solid var(--color-border)' }}>
            <p>{f.message}</p>
            <p className="text-muted" style={{ fontSize: 12 }}>User #{f.userId} · {new Date(f.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {feedback.length === 0 && <p className="empty-state">No feedback submitted yet.</p>}
      </div>
    </div>
  );
}
