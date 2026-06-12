import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { aiService } from '../features/ai/aiService';

export default function AITutor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Habari! Mimi ni Amina, mwalimu wako wa Kiswahili. (Hello! I am Amina, your Kiswahili tutor.) Tuanze? (Shall we begin?)' },
  ]);
  const [input, setInput] = useState('');
  const [usage, setUsage] = useState(null);
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { aiService.usage().then(setUsage).catch(() => {}); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setSending(true);
    try {
      const apiMsgs = newMsgs.filter((m) => m.role === 'user' || m.role === 'assistant').slice(-12);
      const res = await aiService.chat(apiMsgs);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
      setUsage({ messages_used: res.messages_used, remaining: res.remaining, tier: res.tier, daily_limit: usage?.daily_limit });
    } catch (e) {
      if (e.response?.status === 403) {
        setLimitReached(true);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: 'Samahani, hitilafu imetokea. (Sorry, an error occurred.)' }]);
      }
    } finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--jade)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', color: 'var(--forest)' }}>Amina · AI Tutor</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--mist)' }}>
              {usage?.tier === 'free' && usage?.daily_limit != null
                ? `${usage.messages_used}/${usage.daily_limit} messages today`
                : usage?.tier ? `${usage.tier} · unlimited` : 'Practice 24/7'}
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{
              padding: '0.7rem 1rem', borderRadius: 16,
              background: m.role === 'user' ? 'var(--forest)' : 'var(--pale)',
              color: m.role === 'user' ? 'white' : 'var(--ink)',
              fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && <Loader2 className="animate-spin text-jade" size={18} />}
        <div ref={endRef} />
      </div>

      {limitReached ? (
        <div style={{ marginTop: 12, padding: '1rem', background: 'rgba(244,168,48,0.12)', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>You have reached today's free message limit.</p>
          <Link to="/student/settings" className="btn-amber">Upgrade to Pro for unlimited practice</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            className="input-field"
            placeholder="Andika ujumbe... (Type a message...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="btn-primary" onClick={send} disabled={sending || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
