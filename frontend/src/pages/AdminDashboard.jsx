import { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, AlertTriangle, BarChart3, TrendingUp, Loader2, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../features/admin/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getStats()
      .then(data => setStats(data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.total_users ?? '—', change: 'All registered users' },
    { icon: BookOpen, label: 'Total Tutors', value: stats.total_tutors ?? '—', change: 'Active tutors' },
    { icon: UserCircle, label: 'Total Students', value: stats.total_students ?? '—', change: 'Active learners' },
    { icon: BookOpen, label: 'Total Bookings', value: stats.total_bookings ?? '—', change: 'All time' },
    { icon: DollarSign, label: 'Total Payments', value: stats.total_payments ?? '—', change: 'Transactions' },
    { icon: AlertTriangle, label: 'Open Disputes', value: stats.total_disputes ?? stats.open_disputes ?? '—', change: 'Needs attention', urgent: ((stats.total_disputes ?? 0) > 0 || (stats.open_disputes ?? 0) > 0) },
  ] : [];

  const quickLinks = [
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/tutors', label: 'Verify Tutors' },
    { to: '/admin/bookings', label: 'View Bookings' },
    { to: '/admin/payments', label: 'View Payments' },
    { to: '/admin/disputes', label: 'Handle Disputes' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}

      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value, change, urgent }) => (
            <div key={label} className={`bg-white rounded-xl border p-5 ${urgent ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <Icon className={`w-4 h-4 ${urgent ? 'text-red-500' : 'text-blue-600'}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
              <div className={`text-xs mt-1 ${urgent ? 'text-red-500' : 'text-gray-400'}`}>{change}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Quick Navigation</h2>
          </div>
          <div className="space-y-2">
            {quickLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{label}</span>
                <span className="text-gray-300 group-hover:text-gray-500 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Platform Analytics</h2>
          </div>
          <div className="text-center py-8 text-gray-400">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Analytics charts coming in a future release</p>
          </div>
        </div>
      </div>
    </div>
  );
}
