import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function FarmerProfile() {
  const [form, setForm] = useState({
    farmName: '', cropDetails: '', location: '', preferredLanguage: 'English',
    landSizeAcres: '', soilType: 'Loamy',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/farmer/profile')
      .then((res) => res.data && setForm((f) => ({ ...f, ...res.data })))
      .catch(() => {});
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/farmer/profile', form);
      setMessage('Profile saved successfully!');
    } catch (err) {
      setMessage('Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Farm Profile" subtitle="Tell us about your farm so we can personalize advice." />
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560 }}>
        <div className="form-group">
          <label className="form-label">Farm Name</label>
          <input className="form-input" value={form.farmName} onChange={update('farmName')} />
        </div>
        <div className="form-group">
          <label className="form-label">Crop Details (comma separated)</label>
          <input className="form-input" placeholder="Rice, Wheat, Sugarcane" value={form.cropDetails} onChange={update('cropDetails')} />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" placeholder="Village, District, State" value={form.location} onChange={update('location')} />
        </div>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Land Size (acres)</label>
            <input className="form-input" type="number" step="0.1" value={form.landSizeAcres} onChange={update('landSizeAcres')} />
          </div>
          <div className="form-group">
            <label className="form-label">Soil Type</label>
            <select className="form-select" value={form.soilType} onChange={update('soilType')}>
              <option>Loamy</option><option>Sandy</option><option>Clay</option><option>Black Soil</option><option>Red Soil</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Preferred Language</label>
          <select className="form-select" value={form.preferredLanguage} onChange={update('preferredLanguage')}>
            <option>English</option><option>Tamil</option><option>Telugu</option>
          </select>
        </div>

        {message && <p style={{ color: 'var(--color-primary)', fontSize: 14, marginBottom: 12 }}>{message}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
