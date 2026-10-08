import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function Recommendation() {
  const [form, setForm] = useState({
    cropName: '', soilType: 'Loamy', temperature: '', humidity: '', rainfall: '', lastDiseaseDetected: '',
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = () => api.get('/recommendation/history').then((res) => setHistory(res.data)).catch(() => {});
  useEffect(() => { loadHistory(); }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/recommendation/generate', form);
      setResult(res.data);
      loadHistory();
    } catch (err) {
      alert('Could not generate recommendation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Recommendations 💡" subtitle="Irrigation, fertilizer and harvest advice based on your conditions." />
      <div className="grid grid-2">
        <form onSubmit={handleSubmit} className="card">
          <div className="form-group"><label className="form-label">Crop Name</label>
            <input className="form-input" required value={form.cropName} onChange={update('cropName')} /></div>
          <div className="form-group"><label className="form-label">Soil Type</label>
            <select className="form-select" value={form.soilType} onChange={update('soilType')}>
              <option>Loamy</option><option>Sandy</option><option>Clay</option><option>Black Soil</option><option>Red Soil</option>
            </select></div>
          <div className="grid grid-3">
            <div className="form-group"><label className="form-label">Temp (°C)</label>
              <input className="form-input" type="number" value={form.temperature} onChange={update('temperature')} /></div>
            <div className="form-group"><label className="form-label">Humidity (%)</label>
              <input className="form-input" type="number" value={form.humidity} onChange={update('humidity')} /></div>
            <div className="form-group"><label className="form-label">Rainfall (mm)</label>
              <input className="form-input" type="number" value={form.rainfall} onChange={update('rainfall')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Last Disease Detected (optional)</label>
            <input className="form-input" value={form.lastDiseaseDetected} onChange={update('lastDiseaseDetected')} /></div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Generating...' : 'Get Recommendation'}</button>
        </form>

        <div className="card card-accent-left">
          <h3 className="font-display" style={{ marginBottom: 12 }}>Latest Advice</h3>
          {!result && <p className="text-muted">Fill the form to generate personalized advice.</p>}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><span className="badge badge-blue">Irrigation</span><p style={{ marginTop: 6 }}>{result.irrigationAdvice}</p></div>
              <div><span className="badge badge-yellow">Fertilizer</span><p style={{ marginTop: 6 }}>{result.fertilizerAdvice}</p></div>
              <div><span className="badge badge-green">Harvest</span><p style={{ marginTop: 6 }}>{result.harvestAdvice}</p></div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="font-display" style={{ marginBottom: 12 }}>History</h3>
          <div className="grid grid-3">
            {history.map((h) => (
              <div key={h.id} className="card">
                <p style={{ fontSize: 13 }}><strong>Irrigation:</strong> {h.irrigationAdvice}</p>
                <p style={{ fontSize: 13 }}><strong>Fertilizer:</strong> {h.fertilizerAdvice}</p>
                <p style={{ fontSize: 13 }}><strong>Harvest:</strong> {h.harvestAdvice}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
