import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../context/AuthContext';

// Module: Expert Consultation (Expert side) - Accept Query / Chat / Close (plain REST)
export default function ExpertQueries() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [activeQuery, setActiveQuery] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');

  const loadAll = () => {
    api.get('/expert/pending').then((res) => setPending(res.data));
    api.get('/expert/assigned').then((res) => setAssigned(res.data));
  };
  useEffect(() => { loadAll(); }, []);

  const accept = async (id) => {
    await api.post(`/expert/${id}/accept`);
    loadAll();
  };

  const openChat = async (q) => {
    setActiveQuery(q);
    const res = await api.get(`/expert/${q.id}/messages`);
    setMessages(res.data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim() || !activeQuery) return;
    await api.post(`/expert/${activeQuery.id}/message`, { message: chatText });
    setChatText('');
    const res = await api.get(`/expert/${activeQuery.id}/messages`);
    setMessages(res.data);
  };

  const closeQuery = async () => {
    if (!activeQuery) return;
    await api.post(`/expert/${activeQuery.id}/close`);
    setActiveQuery(null);
    loadAll();
  };

  return (
    <div>
      <PageHeader title="Farmer Queries 💬" subtitle="Accept pending questions and chat with farmers." />
      <div className="grid grid-2">
        <div className="card">
          <h3 className="font-display" style={{ marginBottom: 10 }}>Pending Questions</h3>
          {pending.map((q) => (
            <div key={q.id} style={{ padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 14 }}>{q.question}</p>
              <button className="btn btn-outline" onClick={() => accept(q.id)}>Accept</button>
            </div>
          ))}
          {pending.length === 0 && <p className="text-muted">No pending questions right now.</p>}

          <div className="divider" />
          <h3 className="font-display" style={{ marginBottom: 10 }}>My Assigned Queries</h3>
          {assigned.map((q) => (
            <div key={q.id} onClick={() => openChat(q)} style={{ cursor: 'pointer', padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 14 }}>{q.question}</p>
              <span className={`badge badge-${q.status === 'CLOSED' ? 'green' : 'blue'}`}>{q.status}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="font-display">{activeQuery ? 'Chat with Farmer' : 'Select a query to chat'}</h3>
            {activeQuery && <button className="btn btn-outline" onClick={closeQuery}>Close Query</button>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((m) => (
              <ChatBubble key={m.id} text={m.message} isUser={m.senderId === user.userId} />
            ))}
          </div>
          {activeQuery && (
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <input className="form-input" value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Type a reply..." />
              <button className="btn btn-primary" type="submit">Send</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
