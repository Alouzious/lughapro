import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { courseService } from '../features/courses/courseService';
import LevelBadge from '../components/LevelBadge';

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.myEnrollments()
      .then((d) => setEnrollments(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Continue where you left off.</p>
        </div>
        <Link to="/courses" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Browse Catalog</Link>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin text-jade" size={26} /></div>}
      {!loading && enrollments.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--mist)' }}>
          <BookOpen size={34} style={{ margin: '0 auto 12px', color: 'var(--fog)' }} />
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="text-jade" style={{ display: 'inline-block', marginTop: 8 }}>Explore free courses</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {enrollments.map((e) => (
          <Link key={e.id} to={`/courses/${e.course_id}`} className="card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <LevelBadge level={e.course_level} />
              {e.completed_at && <CheckCircle size={18} className="text-jade" />}
            </div>
            <h3 style={{ fontWeight: 700, color: 'var(--ink)' }}>{e.course_title}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--mist)', marginTop: 6 }}>
              Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
              {e.completed_at ? ' · Completed' : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
