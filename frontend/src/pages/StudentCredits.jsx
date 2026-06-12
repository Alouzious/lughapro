import { useEffect, useState } from 'react';
import { Loader2, Coins, TrendingUp } from 'lucide-react';
import { creditService } from '../features/credits/creditService';
import { LEVELS, CREDIT_RULES } from '../utils/constants';
import LevelBadge from '../components/LevelBadge';

export default function StudentCredits() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([creditService.me(), creditService.history()])
      .then(([s, h]) => { setSummary(s); setHistory(Array.isArray(h) ? h : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin text-jade" size={26} /></div>;

  const total = summary?.total_credits || 0;
  const next = summary?.next_threshold;
  const level = summary?.level_unlocked || 'A1';
  const pct = next ? Math.min(100, Math.round((total / next) * 100)) : 100;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Credits & Levels</h1>
      <p className="text-gray-500 text-sm mb-6">Earn credits to unlock higher CEFR levels and certificates.</p>

      <div className="card" style={{ padding: '1.5rem', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Coins className="text-amber" size={24} />
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--forest)' }}>{total}</span>
            <span style={{ color: 'var(--mist)' }}>credits</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>Current level</span>
            <LevelBadge level={level} size="lg" />
          </div>
        </div>
        <div className="progress-wrap"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <p style={{ fontSize: '0.8rem', color: 'var(--mist)', marginTop: 8 }}>
          {next ? `${total} / ${next} credits to unlock the next level` : 'You have reached the highest level — C2!'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
        {LEVELS.map((l) => {
          const reached = total >= l.threshold;
          return (
            <div key={l.code} className="card" style={{ padding: '0.85rem', textAlign: 'center', opacity: reached ? 1 : 0.5 }}>
              <LevelBadge level={l.code} />
              <p style={{ fontSize: '0.7rem', color: 'var(--mist)', marginTop: 6 }}>{l.threshold} cr</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ color: 'var(--forest)', marginBottom: 12, fontSize: '1rem' }}>How to earn credits</h3>
          {CREDIT_RULES.map((r) => (
            <div key={r.reason} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--sand)' }}>
              <span style={{ color: 'var(--slate)' }}>{r.reason}</span>
              <span style={{ fontWeight: 700, color: 'var(--jade)' }}>+{r.credits}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ color: 'var(--forest)', marginBottom: 12, fontSize: '1rem' }}>Recent activity</h3>
          {history.length === 0 && <p style={{ color: 'var(--mist)', fontSize: '0.85rem' }}>No credit activity yet.</p>}
          {history.slice(0, 10).map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', fontSize: '0.82rem', borderBottom: '1px solid var(--sand)' }}>
              <span style={{ color: 'var(--slate)', textTransform: 'capitalize' }}>{tx.reason.replace(/_/g, ' ')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--jade)' }}>
                <TrendingUp size={12} /> +{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
