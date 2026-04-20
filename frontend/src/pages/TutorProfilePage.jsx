import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { tutorService } from '../features/tutors/tutorService';
import { useAuth } from '../context/AuthContext';

export default function TutorProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: '',
    hourly_rate: '',
    availability_summary: '',
    expertise: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    if (user?.role !== 'tutor') {
      navigate('/student/dashboard');
      return;
    }
    tutorService.getProfile()
      .then(profile => {
        setForm({
          bio: profile.bio || '',
          hourly_rate: profile.hourly_rate?.toString() || '',
          availability_summary: profile.availability_summary || '',
          expertise: profile.expertise || '',
        });
        setIsNew(false);
      })
      .catch(() => setIsNew(true))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const payload = {
      bio: form.bio,
      hourly_rate: parseFloat(form.hourly_rate),
      availability_summary: form.availability_summary || null,
      expertise: form.expertise || null,
    };
    try {
      if (isNew) {
        await tutorService.createProfile(payload);
        setIsNew(false);
        setSuccess('Profile created successfully.');
      } else {
        await tutorService.updateProfile(payload);
        setSuccess('Profile updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isNew ? 'Create' : 'Edit'} Tutor Profile</h1>
          <p className="text-sm text-gray-500">This information is visible to students</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              id="bio" name="bio" rows={4} required value={form.bio} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
              placeholder="Tell students about your teaching experience and approach..."
            />
          </div>
          <div>
            <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-1.5">Hourly Rate (USD)</label>
            <input
              id="hourly_rate" name="hourly_rate" type="number" min="1" step="0.01" required value={form.hourly_rate} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="e.g. 25"
            />
          </div>
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1.5">Areas of Expertise</label>
            <input
              id="expertise" name="expertise" type="text" value={form.expertise} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="e.g. Beginner, Conversational, Business Kiswahili"
            />
          </div>
          <div>
            <label htmlFor="availability_summary" className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
            <input
              id="availability_summary" name="availability_summary" type="text" value={form.availability_summary} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="e.g. Weekdays 9am–5pm EAT"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {saving ? 'Saving...' : isNew ? 'Create Profile' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/tutor/dashboard')}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
