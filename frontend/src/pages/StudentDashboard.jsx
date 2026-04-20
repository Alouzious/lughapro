import { BookOpen, Calendar, TrendingUp, Loader2, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../features/bookings/bookingService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</h1>
        <p className="text-gray-500 text-sm mt-1">Continue your Kiswahili learning journey</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{upcoming.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Upcoming Sessions</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{completed.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Completed Sessions</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total Bookings</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">My Sessions</h2>
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-6 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No sessions yet</p>
            <Link to="/tutors" className="text-sm text-blue-600 hover:text-blue-500 mt-1 inline-block">
              Browse tutors to book a session
            </Link>
          </div>
        )}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Session with {b.tutor_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(b.session_time).toLocaleString()}</p>
                  {b.notes && <p className="text-xs text-gray-400 mt-0.5">{b.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                  {b.status === 'completed' && (
                    <Link to={`/rate/${b.id}`} className="text-xs text-blue-600 hover:text-blue-500">
                      Rate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
