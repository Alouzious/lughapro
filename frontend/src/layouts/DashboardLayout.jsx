import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Star,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/sessions', icon: Calendar, label: 'Sessions' },
  { to: '/tutors', icon: Users, label: 'Find Tutors' },
  { to: '/student/payments', icon: CreditCard, label: 'Payments' },
  { to: '/student/ratings', icon: Star, label: 'Reviews' },
  { to: '/student/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Lugha<span className="text-blue-600">Pro</span></span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
