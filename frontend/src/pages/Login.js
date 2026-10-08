import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function homeRouteFor(role) {
  if (role === 'EXPERT') return '/expert';
  if (role === 'ADMIN') return '/admin';
  return '/farmer';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate(homeRouteFor(res.data.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 55%, #FFB300 100%)',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: '#fff' }} className="hide-on-mobile">
        <div style={{ fontSize: 56 }}>🌾</div>
        <h1 className="font-display" style={{ fontSize: 42, marginTop: 12, lineHeight: 1.15 }}>KrishiMitra</h1>
        <p style={{ fontSize: 17, maxWidth: 460, marginTop: 14, opacity: 0.95 }}>
          AI-based farmer advisory system with multilingual support — ask questions
          in English, Tamil or Telugu, detect crop diseases, and chat live with
          agriculture experts, all in one place.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
          {['🤖 Multilingual AI Chat', '🌿 Disease Scan', '💬 Live Expert Chat', '⛅ Weather'].map((f) => (
            <div key={f} style={{ background: 'rgba(255,255,255,0.18)', padding: '10px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ width: 440, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px', boxShadow: '-10px 0 40px rgba(0,0,0,0.08)' }}>
        <h2 className="font-display" style={{ fontSize: 26, marginBottom: 4 }}>Welcome back</h2>
        <p className="text-muted" style={{ marginBottom: 28 }}>Log in as a Farmer or Expert.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <p style={{ color: 'var(--color-danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ marginTop: 22, fontSize: 14 }} className="text-muted">
          New to KrishiMitra? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
