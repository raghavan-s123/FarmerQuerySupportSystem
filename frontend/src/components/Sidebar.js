import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS_BY_ROLE = {
  FARMER: [
    { to: '/farmer', label: 'Dashboard', icon: '🏡' },
    { to: '/farmer/profile', label: 'Farm Profile', icon: '📝' },
    { to: '/farmer/ai-query', label: 'Ask AI', icon: '🤖' },
    { to: '/farmer/disease', label: 'Disease Scan', icon: '🌿' },
    { to: '/farmer/weather', label: 'Weather', icon: '⛅' },
    { to: '/farmer/recommendation', label: 'Recommendations', icon: '💡' },
    { to: '/farmer/market', label: 'Market Prices', icon: '💰' },
    { to: '/farmer/schemes', label: 'Govt Schemes', icon: '🏛️' },
    { to: '/farmer/expert', label: 'Ask Expert', icon: '👨‍🌾' },
    { to: '/farmer/notifications', label: 'Notifications', icon: '🔔' },
  ],
  STUDENT: [
    { to: '/farmer', label: 'Dashboard', icon: '🏡' },
    { to: '/farmer/ai-query', label: 'Ask AI', icon: '🤖' },
    { to: '/farmer/disease', label: 'Disease Scan', icon: '🌿' },
    { to: '/farmer/market', label: 'Market Prices', icon: '💰' },
    { to: '/farmer/schemes', label: 'Govt Schemes', icon: '🏛️' },
  ],
  EXPERT: [
    { to: '/expert', label: 'Dashboard', icon: '🏡' },
    { to: '/expert/queries', label: 'Farmer Queries', icon: '💬' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/experts', label: 'Experts', icon: '👨‍🌾' },
    { to: '/admin/feedback', label: 'Feedback', icon: '📩' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const links = LINKS_BY_ROLE[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'linear-gradient(180deg, #2E7D32, #1B5E20)',
      color: '#fff',
      padding: '24px 18px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <span style={{ fontSize: 28 }}>🌾</span>
        <span className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>KrishiMitra</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/farmer' || link.to === '/expert' || link.to === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', borderRadius: 12, fontWeight: 500, fontSize: 14.5,
              background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent', color: '#fff',
            })}
          >
            <span>{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>
          {user.fullName} · {user.role} {user.preferredLanguage ? `· ${user.preferredLanguage}` : ''}
        </div>
        <button className="btn btn-accent btn-block" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
