import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { bookingService } from '../features/bookings/bookingService';
import { useAuth } from '../context/AuthContext';

export default function BookingForm() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ session_time: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [minDateTime] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  if (user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Only students can book sessions.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await bookingService.create({
        tutor_id: tutorId,
        session_time: new Date(form.session_time).toISOString(),
        notes: form.notes || null,
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">Book a Session</h2>
        <p className="mt-1 text-center text-sm text-gray-500">Schedule your Kiswahili lesson</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="session_time" className="block text-sm font-medium text-gray-700 mb-1.5">Session Date & Time</label>
              <input
                id="session_time" name="session_time" type="datetime-local" required
                min={minDateTime} value={form.session_time} onChange={handleChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">Notes <span className="text-gray-400">(optional)</span></label>
              <textarea
                id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                placeholder="Any specific topics or goals for this session..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Booking...</span> : 'Confirm Booking'}
              </button>
              <button type="button" onClick={() => navigate(-1)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
