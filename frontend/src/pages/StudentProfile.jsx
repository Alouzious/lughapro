import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Loader2, ArrowLeft } from 'lucide-react';
import { userService } from '../features/users/userService';

export default function StudentProfile() {
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    phone: '',
    location: '',
    profile_image_url: '',
    learning_goals: '',
    learning_level: '',
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    userService.getMe()
      .then(data => {
        setEmail(data.email || '');
        setForm({
          full_name: data.full_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          profile_image_url: data.profile_image_url || '',
          learning_goals: data.learning_goals || '',
          learning_level: data.learning_level || '',
        });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

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
    try {
      await userService.updateMe(form);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
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
      <Link to="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your account information</p>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              id="email" type="email" value={email} disabled
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              id="full_name" name="full_name" type="text" value={form.full_name} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
              placeholder="Tell us a bit about yourself..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                id="phone" name="phone" type="text" value={form.phone} onChange={handleChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="+254 700 000000"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input
                id="location" name="location" type="text" value={form.location} onChange={handleChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="City, Country"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile_image_url" className="block text-sm font-medium text-gray-700 mb-1.5">Profile Image URL</label>
            <input
              id="profile_image_url" name="profile_image_url" type="url" value={form.profile_image_url} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="learning_goals" className="block text-sm font-medium text-gray-700 mb-1.5">Learning Goals</label>
            <input
              id="learning_goals" name="learning_goals" type="text" value={form.learning_goals} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="e.g. Conversational fluency, business Kiswahili"
            />
          </div>
          <div>
            <label htmlFor="learning_level" className="block text-sm font-medium text-gray-700 mb-1.5">Learning Level</label>
            <select
              id="learning_level" name="learning_level" value={form.learning_level} onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
