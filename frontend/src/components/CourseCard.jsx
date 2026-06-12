import { Link } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';
import LevelBadge from './LevelBadge';

export default function CourseCard({ course }) {
  const isFree = course.is_free || Number(course.price) === 0;
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card"
      style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          height: 140,
          background: course.thumbnail_url
            ? `center/cover url(${course.thumbnail_url})`
            : 'linear-gradient(135deg, var(--forest), var(--mint))',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <LevelBadge level={course.level} />
        </div>
        {isFree && (
          <span
            style={{
              position: 'absolute', top: 12, right: 12,
              background: '#16a34a', color: 'white',
              padding: '0.2rem 0.6rem', borderRadius: 20,
              fontSize: '0.7rem', fontWeight: 700,
            }}
          >
            FREE
          </span>
        )}
      </div>
      <div style={{ padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
          {course.title}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
          {course.tutor_name || 'LughaPro Official'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--mist)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} className="text-amber" /> {Number(course.avg_rating || 0).toFixed(1)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={13} /> {course.enrolled_count || 0}
          </span>
          {course.estimated_hours ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {course.estimated_hours}h
            </span>
          ) : null}
        </div>
        <div style={{ marginTop: 6 }}>
          {isFree ? (
            <span style={{ fontWeight: 700, color: '#16a34a' }}>Free</span>
          ) : (
            <span style={{ fontWeight: 700, color: 'var(--forest)' }}>${Number(course.price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
