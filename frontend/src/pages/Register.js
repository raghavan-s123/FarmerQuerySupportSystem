import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function homeRouteFor(role) {
  if (role === 'EXPERT') return '/expert';
  if (role === 'ADMIN') return '/admin';
  return '/farmer';
}

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    role: 'FARMER', preferredLanguage: 'English', expertDomain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data);
      navigate(homeRouteFor(res.data.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 55%, #FFB300 100%)', padding: 24,
    }}>
      <div className="card" style={{ width: 460, background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 40 }}>🌾</div>
          <h2 className="font-display" style={{ fontSize: 24, marginTop: 6 }}>Create your account</h2>
          <p className="text-muted" style={{ fontSize: 14 }}>Join as a Farmer or Agriculture Expert.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.fullName} onChange={update('fullName')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={update('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={update('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password} onChange={update('password')} />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select className="form-select" value={form.role} onChange={update('role')}>
              <option value="FARMER">Farmer</option>
              <option value="STUDENT">Student</option>
              <option value="EXPERT">Agriculture Expert</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Preferred language - drives the multilingual AI chat / voice replies */}
          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select className="form-select" value={form.preferredLanguage} onChange={update('preferredLanguage')}>
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          {/* Only shown for Experts, matching the paper's "Login Page for Experts:
              Details of expert and their domain" module */}
          {form.role === 'EXPERT' && (
            <div className="form-group">
              <label className="form-label">Domain of Expertise</label>
              <input className="form-input" placeholder="e.g. Soil Science, Plant Pathology"
                     value={form.expertDomain} onChange={update('expertDomain')} />
            </div>
          )}

          {error && <p style={{ color: 'var(--color-danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 14, textAlign: 'center' }} className="text-muted">
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
