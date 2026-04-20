import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { bookingService } from '../features/bookings/bookingService';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function TutorSessions() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    bookingService.getMyBookings()
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load sessions.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      const updated = await bookingService.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updated } : b));
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <Link to="/tutor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all your teaching sessions</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No sessions yet</p>
            <p className="text-xs mt-1">Sessions will appear here once students book with you</p>
          </div>
        )}
        {!loading && !error && bookings.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Session Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{b.student_name || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{new Date(b.session_time).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs max-w-xs truncate">{b.notes || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                          disabled={updating === b.id}
                          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-40"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                          disabled={updating === b.id}
                          className="p-1 text-red-500 hover:text-red-600 disabled:opacity-40"
                          title="Cancel"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
