import { Users, Calendar, DollarSign, Star, TrendingUp, Clock } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Total Students', value: '34', change: '+5 this month' },
  { icon: Calendar, label: 'Sessions This Month', value: '47', change: '3 upcoming' },
  { icon: DollarSign, label: 'Earnings (USD)', value: '$1,240', change: 'This month' },
  { icon: Star, label: 'Rating', value: '4.9', change: 'Based on 97 reviews' },
];

export default function TutorDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your sessions and track your performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, change }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{change}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        <div className="text-center py-8 text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No upcoming sessions scheduled</p>
        </div>
      </div>
    </div>
  );
}
