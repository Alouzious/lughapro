import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, Lock, ArrowRight, ArrowLeft, Award } from 'lucide-react';
import { courseService } from '../features/courses/courseService';

export default function CoursePlayer() {
  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const [prog, setProg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const modules = prog?.modules || [];
  const current = modules.find((m) => m.id === moduleId);
  const idx = modules.findIndex((m) => m.id === moduleId);
  const next = modules[idx + 1];

  const load = useCallback(() => {
    setLoading(true);
    courseService.progress(id)
      .then((p) => setProg(p))
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(load, [load]);

  useEffect(() => {
    setQuiz(null); setResult(null); setAnswers({}); setError('');
    if (current?.has_quiz && !current?.locked) {
      courseService.getQuiz(moduleId).then(setQuiz).catch(() => {});
    }
  }, [moduleId, current?.has_quiz, current?.locked]);

  const handleComplete = async () => {
    setBusy(true); setError('');
    try {
      await courseService.completeModule(moduleId);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Could not complete module.');
    } finally { setBusy(false); }
  };

  const handleQuizSubmit = async () => {
    setBusy(true); setError('');
    try {
      const payload = Object.entries(answers).map(([question_id, selected_option]) => ({ question_id, selected_option }));
      const res = await courseService.submitQuiz(moduleId, payload);
      setResult(res);
      if (res.passed) load();
    } catch (e) {
      setError(e.response?.data?.error || 'Could not submit quiz.');
    } finally { setBusy(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin text-jade" size={28} /></div>;
  if (!current) return <p style={{ textAlign: 'center', padding: '4rem' }}>Module not found. <Link to={`/courses/${id}`}>Back to course</Link></p>;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{ width: 280, borderRight: '1.5px solid var(--sand)', background: 'white', padding: '1.25rem', overflowY: 'auto' }}>
        <Link to={`/courses/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--slate)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={14} /> {prog?.course?.title}
        </Link>
        {modules.map((m, i) => {
          const active = m.id === moduleId;
          const locked = m.locked && !m.is_free_preview;
          return (
            <button
              key={m.id}
              disabled={locked}
              onClick={() => navigate(`/courses/${id}/learn/${m.id}`)}
              style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.6rem 0.7rem', borderRadius: 10, border: 'none', cursor: locked ? 'not-allowed' : 'pointer',
                background: active ? 'var(--pale)' : 'transparent', marginBottom: 4,
                color: active ? 'var(--forest)' : 'var(--slate)', fontSize: '0.83rem', fontWeight: active ? 600 : 500,
                opacity: locked ? 0.5 : 1,
              }}
            >
              {m.completed ? <CheckCircle size={16} className="text-jade" /> : locked ? <Lock size={14} /> : <span style={{ width: 16, textAlign: 'center' }}>{i + 1}</span>}
              <span style={{ flex: 1 }}>{m.title}</span>
            </button>
          );
        })}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 820, margin: '0 auto', overflowY: 'auto' }}>
        <h1 className="font-display" style={{ fontSize: '1.7rem', color: 'var(--forest)', marginBottom: 16 }}>{current.title}</h1>

        {current.content_type === 'video' && current.content_url ? (
          <div style={{ aspectRatio: '16/9', marginBottom: 20, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <iframe title={current.title} src={current.content_url} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        ) : null}

        {current.content_body && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: 20, lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
            {current.content_body}
          </div>
        )}

        {error && <p style={{ color: 'var(--rust)', marginBottom: 12 }}>{error}</p>}

        {/* Quiz */}
        {current.has_quiz && quiz && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: 20 }}>
            <h3 style={{ color: 'var(--forest)', marginBottom: 12 }}>Quiz (pass: {quiz.pass_score}%)</h3>
            {quiz.questions.map((q, qi) => (
              <div key={q.id} style={{ marginBottom: 18 }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>{qi + 1}. {q.question_text}</p>
                {(q.options || []).map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.4rem 0', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt.id}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                      disabled={current.completed}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            ))}
            {result && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: 10, marginBottom: 12, background: result.passed ? 'var(--pale)' : 'rgba(192,70,30,0.1)', color: result.passed ? 'var(--forest)' : 'var(--rust)', fontWeight: 600 }}>
                Score: {result.score}% — {result.passed ? `Passed! +${result.credits_awarded} credits` : 'Try again after reviewing the lesson.'}
              </div>
            )}
            {!current.completed && (
              <button className="btn-primary" onClick={handleQuizSubmit} disabled={busy || Object.keys(answers).length < quiz.questions.length}>
                {busy ? <Loader2 className="animate-spin" size={16} /> : 'Submit Quiz'}
              </button>
            )}
          </div>
        )}

        {/* Complete / Next controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!current.has_quiz && !current.completed && (
            <button className="btn-primary" onClick={handleComplete} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : <>Mark Complete <CheckCircle size={16} /></>}
            </button>
          )}
          {current.completed && (
            <span className="tag" style={{ background: 'var(--pale)', color: 'var(--forest)' }}><CheckCircle size={14} style={{ marginRight: 4 }} /> Completed</span>
          )}
          {next && (
            <button
              className="btn-amber"
              disabled={!current.completed}
              onClick={() => navigate(`/courses/${id}/learn/${next.id}`)}
            >
              Next Module <ArrowRight size={16} />
            </button>
          )}
          {!next && current.completed && (
            <Link to="/certificates" className="btn-amber"><Award size={16} /> View Certificates</Link>
          )}
        </div>
      </main>
    </div>
  );
}
