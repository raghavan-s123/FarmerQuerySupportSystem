import React, { useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function Weather() {
  const [location, setLocation] = useState('Coimbatore');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/weather', { params: { location } });
      setWeather(res.data);
    } catch (err) {
      alert('Could not fetch weather. Check your backend/API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Weather ⛅" subtitle="Live temperature, humidity and rainfall for your location." />
      <form onSubmit={fetchWeather} className="card" style={{ display: 'flex', gap: 10, maxWidth: 500, marginBottom: 20 }}>
        <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter city/village" />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? '...' : 'Check'}</button>
      </form>
      {weather && (
        <div className="grid grid-3">
          <div className="stat-card"><div className="stat-value">{weather.temperature}°C</div><div className="stat-label">Temperature</div></div>
          <div className="stat-card"><div className="stat-value">{weather.humidity}%</div><div className="stat-label">Humidity</div></div>
          <div className="stat-card"><div className="stat-value">{weather.rainfall} mm</div><div className="stat-label">Rainfall</div></div>
        </div>
      )}
    </div>
  );
}
