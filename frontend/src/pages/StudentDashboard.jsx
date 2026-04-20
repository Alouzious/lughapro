import { BookOpen, Calendar, Clock, Star, TrendingUp, Award } from 'lucide-react';

const stats = [
  { icon: Clock, label: 'Hours Learned', value: '24', change: '+3 this week' },
  { icon: Calendar, label: 'Sessions Booked', value: '8', change: '2 upcoming' },
  { icon: Star, label: 'Avg. Rating Given', value: '4.8', change: 'Last 5 sessions' },
  { icon: Award, label: 'Certificates', value: '2', change: '1 in progress' },
];

export default function StudentDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1">Continue your Kiswahili learning journey</p>
      </div>

      {/* Stats grid */}
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

      {/* Upcoming sessions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No upcoming sessions</p>
          <a href="/tutors" className="text-sm text-blue-600 hover:text-blue-500 mt-1 inline-block">
            Browse tutors to book a session
          </a>
        </div>
      </div>
    </div>
  );
}
