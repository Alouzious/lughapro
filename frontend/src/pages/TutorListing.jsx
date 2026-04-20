import { Search, Star, Filter, BookOpen, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorService } from '../features/tutors/tutorService';

function TutorCard({ tutor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{tutor.full_name}</h3>
          </div>
          {tutor.expertise && (
            <p className="text-sm text-gray-500">{tutor.expertise}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{tutor.average_rating > 0 ? tutor.average_rating.toFixed(1) : 'New'}</span>
          </div>
          {tutor.bio && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{tutor.bio}</p>
          )}
          {tutor.availability_summary && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{tutor.availability_summary}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="text-sm font-semibold text-gray-900">${tutor.hourly_rate}<span className="text-gray-400 font-normal">/hr</span></span>
        <Link to={`/book/${tutor.id}`} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Book Session
        </Link>
      </div>
    </div>
  );
}

export default function TutorListing() {
  const [tutors, setTutors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    tutorService.list({ page, limit: 12 })
      .then(data => {
        if (!cancelled) {
          setTutors(data.tutors || []);
          setTotal(data.total || 0);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load tutors. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Kiswahili Tutor</h1>
        <p className="text-gray-500">Connect with verified expert tutors for personalised learning sessions</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, specialty, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12 text-red-600 text-sm">{error}</div>
      )}

      {!loading && !error && tutors.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No tutors found yet. Check back soon.</div>
      )}

      {!loading && !error && tutors.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 12 >= total}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
