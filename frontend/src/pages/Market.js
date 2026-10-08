import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function Market() {
  const [prices, setPrices] = useState([]);
  const [crop, setCrop] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => { api.get('/market/prices').then((res) => setPrices(res.data)); }, []);

  const searchHistory = async (e) => {
    e.preventDefault();
    if (!crop) return;
    const res = await api.get('/market/history', { params: { crop } });
    setHistory(res.data);
  };

  return (
    <div>
      <PageHeader title="Market Prices 💰" subtitle="Latest crop prices and price history from nearby markets." />
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="font-display" style={{ marginBottom: 12 }}>Today's Prices</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 13 }}>
              <th style={{ padding: 8 }}>Crop</th><th>Market</th><th>Price / Quintal</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: 8, fontWeight: 600 }}>{p.cropName}</td>
                <td>{p.marketName}</td>
                <td>₹{p.pricePerQuintal}</td>
                <td>{p.recordedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {prices.length === 0 && <p className="empty-state">No prices available yet.</p>}
      </div>

      <div className="card">
        <h3 className="font-display" style={{ marginBottom: 12 }}>Search Price History</h3>
        <form onSubmit={searchHistory} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input className="form-input" placeholder="e.g. Wheat" value={crop} onChange={(e) => setCrop(e.target.value)} />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
        {history.map((h) => (
          <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--color-border)' }}>
            <span>{h.marketName} · {h.recordedDate}</span>
            <strong>₹{h.pricePerQuintal}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
