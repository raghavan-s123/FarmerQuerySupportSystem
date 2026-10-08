import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then((res) => setStats(res.data)); }, []);
  if (!stats) return <p className="text-muted">Loading...</p>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total Farmers', value: stats.totalFarmers },
    { label: 'Total Experts', value: stats.totalExperts },
    { label: 'AI Queries Asked', value: stats.totalAiQueries },
    { label: 'Disease Scans Done', value: stats.totalDiseaseScans },
    { label: 'Expert Queries', value: stats.totalExpertQueries },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard 📊" subtitle="Platform-wide analytics and reports." />
      <div className="grid grid-3">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
