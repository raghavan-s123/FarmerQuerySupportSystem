import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../context/AuthContext';

// Module: Expert Consultation (Farmer side) - Ask Expert / Chat / view status (plain REST)
export default function ExpertAsk() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [myQueries, setMyQueries] = useState([]);
  const [activeQuery, setActiveQuery] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');

  const loadQueries = () => api.get('/expert/my-queries').then((res) => setMyQueries(res.data));
  useEffect(() => { loadQueries(); }, []);

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    await api.post('/expert/ask', { question });
    setQuestion('');
    loadQueries();
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

  return (
    <div>
      <PageHeader title="Ask Expert 👨‍🌾" subtitle="Get help from a certified agriculture expert." />

      <div className="grid grid-2">
        <div className="card">
          <h3 className="font-display" style={{ marginBottom: 12 }}>New Question</h3>
          <form onSubmit={submitQuestion}>
            <textarea className="form-input" rows={4} placeholder="Describe your farming issue..."
                      value={question} onChange={(e) => setQuestion(e.target.value)} required />
            <button className="btn btn-primary" style={{ marginTop: 10 }} type="submit">Submit to Expert</button>
          </form>

          <div className="divider" />
          <h4 style={{ marginBottom: 10 }}>My Questions</h4>
          {myQueries.map((q) => (
            <div key={q.id} onClick={() => openChat(q)} style={{ cursor: 'pointer', padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 14 }}>{q.question}</p>
              <span className={`badge badge-${q.status === 'PENDING' ? 'yellow' : q.status === 'ACCEPTED' ? 'blue' : 'green'}`}>{q.status}</span>
            </div>
          ))}
          {myQueries.length === 0 && <p className="text-muted">No questions asked yet.</p>}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 480 }}>
          <h3 className="font-display" style={{ marginBottom: 12 }}>
            {activeQuery ? `Chat: ${activeQuery.question.slice(0, 40)}...` : 'Select a question to chat'}
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((m) => (
              <ChatBubble key={m.id} text={m.message} isUser={m.senderId === user.userId} />
            ))}
          </div>
          {activeQuery && (
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <input className="form-input" value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Type a message..." />
              <button className="btn btn-primary" type="submit">Send</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
