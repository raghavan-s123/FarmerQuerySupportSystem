import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="font-display" style={{ fontSize: 26, color: 'var(--color-primary)' }}>{title}</h1>
        {subtitle && <p className="text-muted" style={{ marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
