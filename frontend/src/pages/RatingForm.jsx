import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Loader2 } from 'lucide-react';
import { ratingService } from '../features/ratings/ratingService';
import { useAuth } from '../context/AuthContext';

export default function RatingForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ tutor_id: '', rating: 0, review_text: '' });
  const [hovered, setHovered] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Only students can submit ratings.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!form.tutor_id) {
      setError('Tutor ID is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await ratingService.create({
        tutor_id: form.tutor_id,
        booking_id: bookingId,
        rating: form.rating,
        review_text: form.review_text || null,
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">Rate Your Session</h2>
        <p className="mt-1 text-center text-sm text-gray-500">Share your experience to help others</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="tutor_id" className="block text-sm font-medium text-gray-700 mb-1.5">Tutor ID</label>
              <input
                id="tutor_id" name="tutor_id" type="text" required
                value={form.tutor_id}
                onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Tutor's UUID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        n <= (hovered || form.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {form.rating > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-1.5">Review <span className="text-gray-400">(optional)</span></label>
              <textarea
                id="review_text" name="review_text" rows={4}
                value={form.review_text}
                onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                placeholder="Share what you liked about this session..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span> : 'Submit Rating'}
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
