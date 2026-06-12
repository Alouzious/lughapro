import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { courseService } from '../features/courses/courseService';
import { LEVEL_CODES } from '../utils/constants';
import CourseCard from '../components/CourseCard';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [level, setLevel] = useState('');
  const [type, setType] = useState(''); // '', 'free', 'paid'
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (level) params.level = level;
    if (type === 'free') params.is_free = true;
    if (type === 'paid') params.is_free = false;
    courseService
      .list(params)
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  }, [level, type]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.tutor_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="font-display" style={{ fontSize: '2.2rem', color: 'var(--forest)' }}>Course Catalog</h1>
        <p style={{ color: 'var(--slate)', marginTop: 6 }}>
          Structured Kiswahili courses — earn credits and unlock new levels as you learn.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--mist)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 36 }}
            placeholder="Search courses or tutors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field" style={{ width: 'auto' }} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          {LEVEL_CODES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin text-jade" size={28} />
        </div>
      )}
      {error && !loading && <p style={{ color: 'var(--rust)' }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p style={{ color: 'var(--mist)', textAlign: 'center', padding: '3rem' }}>No courses match your filters.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
