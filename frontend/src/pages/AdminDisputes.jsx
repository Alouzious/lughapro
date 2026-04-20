import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { adminService } from '../features/admin/adminService';
import { disputeService } from '../features/disputes/disputeService';

const statusColors = {
  open: 'bg-red-50 text-red-700',
  under_review: 'bg-yellow-50 text-yellow-700',
  resolved: 'bg-green-50 text-green-700',
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    adminService.listDisputes()
      .then(data => setDisputes(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load disputes.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (disputeId, status) => {
    setUpdating(disputeId);
    try {
      await disputeService.updateStatus(disputeId, status);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status } : d));
    } catch {
      setError('Failed to update dispute status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500 text-sm mt-1">Manage platform disputes</p>
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
        {!loading && !error && disputes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No disputes found</p>
          </div>
        )}
        {!loading && !error && disputes.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Raised By</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {disputes.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{d.raised_by_name || d.user_name || '—'}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-600">{d.booking_id || '—'}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{d.reason || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[d.status] || 'bg-gray-100 text-gray-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {d.status === 'open' && (
                        <button
                          onClick={() => handleStatusUpdate(d.id, 'under_review')}
                          disabled={updating === d.id}
                          className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-40 transition-colors"
                        >
                          Review
                        </button>
                      )}
                      {d.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusUpdate(d.id, 'resolved')}
                          disabled={updating === d.id}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 transition-colors"
                        >
                          Resolve
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
