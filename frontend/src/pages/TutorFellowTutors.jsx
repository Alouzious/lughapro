import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2, ArrowLeft, Star } from 'lucide-react';
import { tutorService } from '../features/tutors/tutorService';

export default function TutorFellowTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    tutorService.list()
      .then(data => setTutors(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load tutors.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link to="/tutor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fellow Tutors on LughaPro</h1>
        <p className="text-gray-500 text-sm mt-1">Browse other tutors on the platform</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}

      {!loading && !error && tutors.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No other tutors yet</p>
        </div>
      )}

      {!loading && !error && tutors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutors.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{t.full_name || t.user_name || 'Tutor'}</p>
                  {t.expertise && <p className="text-xs text-gray-500 truncate mt-0.5">{t.expertise}</p>}
                </div>
              </div>
              {t.bio && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{t.bio}</p>}
              <div className="flex items-center justify-between">
                {t.hourly_rate && (
                  <span className="text-sm font-semibold text-gray-900">${t.hourly_rate}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                )}
                {t.average_rating != null && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{parseFloat(t.average_rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
