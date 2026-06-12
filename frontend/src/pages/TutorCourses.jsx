import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Edit, Send } from 'lucide-react';
import { courseService } from '../features/courses/courseService';
import LevelBadge from '../components/LevelBadge';

const statusStyle = {
  draft: { background: 'var(--sand)', color: 'var(--slate)' },
  pending_review: { background: 'rgba(244,168,48,0.15)', color: 'var(--gold)' },
  published: { background: 'var(--pale)', color: 'var(--forest)' },
  archived: { background: '#eee', color: '#888' },
};

export default function TutorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    courseService.mine()
      .then((d) => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (id) => {
    await courseService.publish(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your Kiswahili courses.</p>
        </div>
        <Link to="/tutor/courses/new" className="btn-amber" style={{ padding: '0.55rem 1.25rem' }}>
          <Plus size={16} /> New Course
        </Link>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin text-jade" size={26} /></div>}
      {!loading && courses.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--mist)' }}>
          <p>No courses yet. Create your first one!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {courses.map((c) => (
          <div key={c.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LevelBadge level={c.level} />
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--mist)' }}>
                  {c.is_free ? 'Free' : `$${Number(c.price).toFixed(2)}`} · {c.enrolled_count} enrolled
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ ...statusStyle[c.status], padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>
                {c.status.replace(/_/g, ' ')}
              </span>
              <Link to={`/tutor/courses/${c.id}/edit`} className="btn-ghost" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                <Edit size={13} /> Edit
              </Link>
              {c.status === 'draft' && (
                <button onClick={() => submit(c.id)} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                  <Send size={13} /> Submit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
