import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Lock, CheckCircle, PlayCircle, Star, Users, Clock } from 'lucide-react';
import { courseService } from '../features/courses/courseService';
import { useAuth } from '../context/AuthContext';
import LevelBadge from '../components/LevelBadge';

const TABS = ['Overview', 'Curriculum', 'Tutor', 'Reviews'];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const detailP = courseService.get(id);
    const progP = isAuthenticated && user?.role === 'student'
      ? courseService.progress(id).catch(() => null)
      : Promise.resolve(null);
    Promise.all([detailP, progP])
      .then(([detail, prog]) => { setData(detail); setProgress(prog); })
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id, isAuthenticated]);

  const enrolled = progress?.enrolled;
  const course = data?.course;
  const modules = (progress?.modules) || (data?.modules) || [];

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEnrolling(true);
    setError('');
    try {
      const body = course.is_free ? {} : { payment_method: 'stellar', stellar_tx_hash: 'simulated' };
      await courseService.enroll(id, body);
      load();
      setTab('Curriculum');
    } catch (e) {
      setError(e.response?.data?.error || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin text-jade" size={28} /></div>;
  }
  if (!course) return <p style={{ textAlign: 'center', padding: '4rem' }}>Course not found.</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <LevelBadge level={course.level} size="lg" />
          {course.is_free && <span style={{ background: '#16a34a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>FREE</span>}
        </div>
        <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--forest)' }}>{course.title}</h1>
        <p style={{ color: 'var(--slate)', marginTop: 8 }}>by {course.tutor_name || 'LughaPro Official'}</p>
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: 12, color: 'var(--mist)', fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={15} className="text-amber" /> {Number(course.avg_rating || 0).toFixed(1)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={15} /> {course.enrolled_count || 0} enrolled</span>
          {course.estimated_hours ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={15} /> {course.estimated_hours}h</span> : null}
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 16 }}>
          {enrolled ? (
            <span className="tag" style={{ background: 'var(--pale)', color: 'var(--forest)', fontSize: '0.85rem' }}>
              <CheckCircle size={15} style={{ marginRight: 6 }} /> Enrolled
            </span>
          ) : (
            <button className="btn-amber" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="animate-spin" size={16} /> : course.is_free ? 'Enroll Free' : `Enroll $${Number(course.price).toFixed(2)}`}
            </button>
          )}
          {!course.is_free && <span style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '1.1rem' }}>${Number(course.price).toFixed(2)}</span>}
        </div>
        {error && <p style={{ color: 'var(--rust)', marginTop: 10 }}>{error}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '1.5px solid var(--sand)', marginBottom: '1.25rem' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              color: tab === t ? 'var(--forest)' : 'var(--mist)',
              borderBottom: tab === t ? '2px solid var(--jade)' : '2px solid transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--ink)', lineHeight: 1.7 }}>{course.description || 'No description provided.'}</p>
          {course.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {course.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
        </div>
      )}

      {tab === 'Curriculum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modules.map((m, i) => {
            const locked = m.locked && !m.is_free_preview;
            const completed = m.completed;
            return (
              <div key={m.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: locked ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {completed ? <CheckCircle size={20} className="text-jade" /> : locked ? <Lock size={18} className="text-mist" /> : <PlayCircle size={20} className="text-forest" />}
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--ink)' }}>{i + 1}. {m.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--mist)' }}>
                      {m.content_type}{m.has_quiz ? ' · quiz' : ''}{m.is_free_preview ? ' · free preview' : ''}
                    </p>
                  </div>
                </div>
                {!locked && (enrolled || m.is_free_preview) && (
                  <Link to={`/courses/${id}/learn/${m.id}`} className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    {completed ? 'Review' : 'Start'}
                  </Link>
                )}
                {locked && <Lock size={16} className="text-mist" />}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'Tutor' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--forest)' }}>{course.tutor_name || 'LughaPro Official'}</h3>
          <p style={{ color: 'var(--slate)', marginTop: 8 }}>Verified Kiswahili instructor on LughaPro.</p>
        </div>
      )}

      {tab === 'Reviews' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--mist)' }}>No reviews yet. Be the first to complete and rate this course.</p>
        </div>
      )}
    </div>
  );
}
