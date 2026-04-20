import { Users, BookOpen, DollarSign, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Total Users', value: '10,234', change: '+124 this week' },
  { icon: BookOpen, label: 'Active Sessions', value: '847', change: 'Live right now' },
  { icon: DollarSign, label: 'Platform Revenue', value: '$28,450', change: 'This month' },
  { icon: AlertTriangle, label: 'Open Disputes', value: '3', change: 'Needs attention', urgent: true },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, change, urgent }) => (
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
  );
}
