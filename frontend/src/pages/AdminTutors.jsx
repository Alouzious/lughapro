import { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { adminService } from '../features/admin/adminService';

const verificationColors = {
  verified: 'bg-green-50 text-green-700',
  pending_review: 'bg-yellow-50 text-yellow-700',
  rejected: 'bg-red-50 text-red-700',
  suspended: 'bg-gray-100 text-gray-500',
};

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    adminService.listTutors()
      .then(data => setTutors(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load tutors.'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerification = async (tutorId, status) => {
    setUpdating(tutorId + status);
    try {
      await adminService.updateTutorVerification(tutorId, status);
      setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, verification_status: status } : t));
    } catch {
      setError('Failed to update verification status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutors</h1>
        <p className="text-gray-500 text-sm mt-1">Manage tutor verification and status</p>
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
        {!loading && !error && tutors.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tutors found</p>
          </div>
        )}
        {!loading && !error && tutors.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tutors.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{t.full_name || t.user_name || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{t.email || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${verificationColors[t.verification_status] || 'bg-gray-100 text-gray-600'}`}>
                      {t.verification_status || 'pending_review'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerification(t.id, 'verified')}
                        disabled={updating !== null || t.verification_status === 'verified'}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 transition-colors"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerification(t.id, 'rejected')}
                        disabled={updating !== null || t.verification_status === 'rejected'}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-40 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerification(t.id, 'suspended')}
                        disabled={updating !== null || t.verification_status === 'suspended'}
                        className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-40 transition-colors"
                      >
                        Suspend
                      </button>
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
