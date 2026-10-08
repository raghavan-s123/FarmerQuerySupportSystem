import React from 'react';

export default function ChatBubble({ text, isUser }) {
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{
        maxWidth: '75%', padding: '12px 16px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'linear-gradient(135deg, #2E7D32, #66BB6A)' : '#fff',
        color: isUser ? '#fff' : 'var(--color-text)',
        border: isUser ? 'none' : '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)', whiteSpace: 'pre-wrap', fontSize: 14.5,
      }}>
        {text}
      </div>
    </div>
  );
}
