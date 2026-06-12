import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Trash2, Save, Send, BookOpen } from 'lucide-react';
import { courseService } from '../features/courses/courseService';
import { useAuth } from '../context/AuthContext';
import { LEVEL_CODES } from '../utils/constants';

const emptyCourse = { title: '', description: '', thumbnail_url: '', level: 'A1', price: 0, estimated_hours: 1, tags: '' };

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyCourse);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    courseService.get(id)
      .then((d) => {
        const c = d.course;
        setForm({
          title: c.title, description: c.description || '', thumbnail_url: c.thumbnail_url || '',
          level: c.level, price: c.price, estimated_hours: c.estimated_hours || 1,
          tags: (c.tags || []).join(', '),
        });
        setModules(d.modules || []);
      })
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const payload = () => ({
    title: form.title,
    description: form.description,
    thumbnail_url: form.thumbnail_url || null,
    level: form.level,
    price: Number(form.price) || 0,
    estimated_hours: Number(form.estimated_hours) || null,
    tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  });

  const saveCourse = async () => {
    setSaving(true); setError('');
    try {
      if (isEdit) {
        await courseService.update(id, payload());
      } else {
        const created = await courseService.create(payload());
        navigate(`/tutor/courses/${created.id}/edit`);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save course.');
    } finally { setSaving(false); }
  };

  const reloadModules = async () => {
    const d = await courseService.get(id);
    setModules(d.modules || []);
  };

  const publish = async () => {
    setSaving(true);
    try {
      await courseService.publish(id);
      navigate('/tutor/courses');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit.');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin text-jade" size={26} /></div>;

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit Course' : 'Create Course'}</h1>
      <p className="text-gray-500 text-sm mb-6">Step {isEdit ? '2' : '1'}: {isEdit ? 'Curriculum & publish' : 'Course information'}</p>

      {error && <p style={{ color: 'var(--rust)', marginBottom: 12 }}>{error}</p>}

      {/* Step 1: Course info */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: 20 }}>
        <h3 style={{ color: 'var(--forest)', marginBottom: 14 }}>Course Info</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="input-field" placeholder="Course title" value={form.title} onChange={(e) => set('title', e.target.value)} />
          <textarea className="input-field" rows={3} placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <input className="input-field" placeholder="Thumbnail image URL (optional)" value={form.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)} />
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="input-field" value={form.level} onChange={(e) => set('level', e.target.value)}>
              {LEVEL_CODES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input className="input-field" type="number" min="0" step="0.01" placeholder="Price (0 = free)" value={form.price} onChange={(e) => set('price', e.target.value)} />
            <input className="input-field" type="number" min="1" placeholder="Hours" value={form.estimated_hours} onChange={(e) => set('estimated_hours', e.target.value)} />
          </div>
          <input className="input-field" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          <button className="btn-primary" onClick={saveCourse} disabled={saving || !form.title}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create & Continue'}</>}
          </button>
        </div>
      </div>

      {/* Step 2: Curriculum (edit mode only) */}
      {isEdit && (
        <>
          <div className="card" style={{ padding: '1.5rem', marginBottom: 20 }}>
            <h3 style={{ color: 'var(--forest)', marginBottom: 14 }}>Curriculum ({modules.length} modules)</h3>
            {modules.length === 0 && <p style={{ color: 'var(--mist)', fontSize: '0.85rem', marginBottom: 12 }}>Add your first module below. The first module should be a free preview.</p>}
            {modules.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--sand)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={15} className="text-jade" />
                  {i + 1}. {m.title}
                  {m.is_free_preview && <span className="tag" style={{ marginLeft: 6 }}>free</span>}
                  {m.has_quiz && <span className="tag tag-amber" style={{ marginLeft: 4 }}>quiz</span>}
                </span>
                <button
                  onClick={async () => { await courseService.deleteModule(m.id); reloadModules(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rust)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <ModuleForm courseId={id} order={modules.length + 1} onAdded={reloadModules} firstModule={modules.length === 0} />

          <div className="card" style={{ padding: '1.5rem', marginTop: 20 }}>
            <h3 style={{ color: 'var(--forest)', marginBottom: 8 }}>Publish</h3>
            <p style={{ color: 'var(--slate)', fontSize: '0.85rem', marginBottom: 12 }}>
              {user?.role === 'admin'
                ? 'As an admin, submitting publishes the course immediately.'
                : 'Submit your course for admin review. Once approved it goes live.'}
            </p>
            <button className="btn-amber" onClick={publish} disabled={saving || modules.length === 0}>
              <Send size={15} /> {user?.role === 'admin' ? 'Publish Now' : 'Submit for Review'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ModuleForm({ courseId, order, onAdded, firstModule }) {
  const [m, setM] = useState({ title: '', content_type: 'text', content_url: '', content_body: '', is_free_preview: firstModule, credits_on_complete: 10 });
  const [addQuiz, setAddQuiz] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setM((p) => ({ ...p, [k]: v }));

  const addQuestion = () => setQuestions((q) => [...q, { question_text: '', options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }], correct_option: 'a' }]);
  const setQ = (i, patch) => setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  const setOpt = (i, oi, val) => setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, options: q.options.map((o, j) => j === oi ? { ...o, text: val } : o) } : q));

  const submit = async () => {
    setSaving(true);
    try {
      const body = {
        title: m.title,
        content_type: m.content_type,
        content_url: m.content_url || null,
        content_body: m.content_body || null,
        order_index: order,
        is_free_preview: m.is_free_preview,
        credits_on_complete: Number(m.credits_on_complete) || 10,
      };
      if (addQuiz && questions.length > 0) {
        body.quiz = { pass_score: 70, credits_on_pass: 20, questions };
      }
      await courseService.addModule(courseId, body);
      setM({ title: '', content_type: 'text', content_url: '', content_body: '', is_free_preview: false, credits_on_complete: 10 });
      setAddQuiz(false); setQuestions([]);
      onAdded();
    } finally { setSaving(false); }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: 'var(--forest)', marginBottom: 14 }}>Add Module</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input-field" placeholder="Module title" value={m.title} onChange={(e) => set('title', e.target.value)} />
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="input-field" value={m.content_type} onChange={(e) => set('content_type', e.target.value)}>
            <option value="text">Rich text</option>
            <option value="video">Video URL</option>
            <option value="pdf">PDF</option>
            <option value="mixed">Mixed</option>
          </select>
          <input className="input-field" type="number" min="0" placeholder="Credits" value={m.credits_on_complete} onChange={(e) => set('credits_on_complete', e.target.value)} />
        </div>
        {(m.content_type === 'video' || m.content_type === 'pdf' || m.content_type === 'mixed') && (
          <input className="input-field" placeholder="Content URL" value={m.content_url} onChange={(e) => set('content_url', e.target.value)} />
        )}
        {(m.content_type === 'text' || m.content_type === 'mixed') && (
          <textarea className="input-field" rows={4} placeholder="Lesson content" value={m.content_body} onChange={(e) => set('content_body', e.target.value)} />
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <input type="checkbox" checked={m.is_free_preview} onChange={(e) => set('is_free_preview', e.target.checked)} /> Free preview
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <input type="checkbox" checked={addQuiz} onChange={(e) => { setAddQuiz(e.target.checked); if (e.target.checked && questions.length === 0) addQuestion(); }} /> Add quiz
        </label>

        {addQuiz && (
          <div style={{ borderLeft: '3px solid var(--mint)', paddingLeft: 14 }}>
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <input className="input-field" placeholder={`Question ${i + 1}`} value={q.question_text} onChange={(e) => setQ(i, { question_text: e.target.value })} style={{ marginBottom: 6 }} />
                {q.options.map((o, oi) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input type="radio" name={`correct-${i}`} checked={q.correct_option === o.id} onChange={() => setQ(i, { correct_option: o.id })} />
                    <input className="input-field" placeholder={`Option ${o.id.toUpperCase()}`} value={o.text} onChange={(e) => setOpt(i, oi, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
            <button className="btn-ghost" onClick={addQuestion} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }} disabled={questions.length >= 10}>
              <Plus size={13} /> Add Question
            </button>
          </div>
        )}

        <button className="btn-primary" onClick={submit} disabled={saving || !m.title}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={15} /> Add Module</>}
        </button>
      </div>
    </div>
  );
}
