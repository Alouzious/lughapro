import { Users, Calendar, Star, TrendingUp, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { bookingService } from '../features/bookings/bookingService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function TutorDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    bookingService.getMyBookings()
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      const updated = await bookingService.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updated } : b));
    } catch {
      // silently fail - could add toast here
    } finally {
      setUpdating(null);
    }
  };

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');
  const uniqueStudents = new Set(bookings.map(b => b.student_id)).size;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{uniqueStudents}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total Students</div>
        </div>
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
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{completed.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Completed Sessions</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">All Sessions</h2>
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
            <p className="text-sm">No sessions scheduled yet</p>
          </div>
        )}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Session with {b.student_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(b.session_time).toLocaleString()}</p>
                  {b.notes && <p className="text-xs text-gray-400 mt-0.5">{b.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                      disabled={updating === b.id}
                      className="p-1 text-green-600 hover:text-green-700 disabled:opacity-40"
                      title="Confirm booking"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button
                      onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                      disabled={updating === b.id}
                      className="p-1 text-red-500 hover:text-red-600 disabled:opacity-40"
                      title="Cancel booking"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(b.id, 'completed')}
                      disabled={updating === b.id}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 transition-colors"
                    >
                      Mark Done
                    </button>
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
