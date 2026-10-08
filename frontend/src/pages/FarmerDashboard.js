import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const TILES = [
  { to: '/farmer/ai-query', icon: '🤖', title: 'Ask AI', desc: 'Multilingual RAG chatbot (English / Tamil / Telugu)', color: '#2E7D32' },
  { to: '/farmer/disease', icon: '🌿', title: 'Disease Scan', desc: 'Upload a leaf photo to detect crop disease', color: '#FF7043' },
  { to: '/farmer/weather', icon: '⛅', title: 'Weather', desc: 'Check temperature, humidity and rainfall', color: '#29ABE2' },
  { to: '/farmer/recommendation', icon: '💡', title: 'Recommendations', desc: 'Irrigation, fertilizer and harvest advice', color: '#FFB300' },
  { to: '/farmer/market', icon: '💰', title: 'Market Prices', desc: 'Latest crop prices from nearby markets', color: '#2E7D32' },
  { to: '/farmer/schemes', icon: '🏛️', title: 'Govt Schemes', desc: 'Explore schemes you may be eligible for', color: '#66BB6A' },
  { to: '/farmer/expert', icon: '👨‍🌾', title: 'Ask Expert', desc: 'Live chat with a certified agriculture expert', color: '#FF7043' },
  { to: '/farmer/notifications', icon: '🔔', title: 'Notifications', desc: 'Weather, disease and price alerts', color: '#29ABE2' },
];

export default function FarmerDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={`Welcome, ${user.fullName.split(' ')[0]} 👋`} subtitle="Here's your farming assistant at a glance." />
      <div className="grid grid-3">
        {TILES.map((tile) => (
          <Link key={tile.to} to={tile.to} className="card" style={{ borderLeft: `5px solid ${tile.color}` }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{tile.icon}</div>
            <h3 className="font-display" style={{ fontSize: 17, marginBottom: 4 }}>{tile.title}</h3>
            <p className="text-muted" style={{ fontSize: 13.5 }}>{tile.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
