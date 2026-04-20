import { useState, useEffect } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { adminService } from '../features/admin/adminService';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-100 text-gray-500',
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.listPayments()
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load payments.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">All payment transactions on the platform</p>
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
        {!loading && !error && payments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No payments found</p>
          </div>
        )}
        {!loading && !error && payments.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-600">{p.booking_id || '—'}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{p.amount}</td>
                  <td className="px-5 py-4 text-gray-600 uppercase">{p.currency || 'USD'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
