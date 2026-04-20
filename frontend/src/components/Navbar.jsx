import { BookOpen, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const close = () => setMenuOpen(false);

  const linkClass = ({ isActive }) =>
    isActive ? 'text-blue-600' : 'hover:text-gray-900 transition-colors';

  const mobileLinkClass = 'block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md';

  const renderDesktopNav = () => {
    if (!isAuthenticated) {
      return (
        <>
          <NavLink to="/tutors" className={linkClass}>Find Tutors</NavLink>
          <NavLink to="/login" className={linkClass}>Sign In</NavLink>
          <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </>
      );
    }
    if (user?.role === 'student') {
      return (
        <>
          <NavLink to="/student/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/tutors" className={linkClass}>Find Tutors</NavLink>
          <NavLink to="/student/bookings" className={linkClass}>My Bookings</NavLink>
          <NavLink to="/student/profile" className={linkClass}>Profile</NavLink>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </>
      );
    }
    if (user?.role === 'tutor') {
      return (
        <>
          <NavLink to="/tutor/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/tutor/profile" className={linkClass}>My Profile</NavLink>
          <NavLink to="/tutor/fellow-tutors" className={linkClass}>Fellow Tutors</NavLink>
          <NavLink to="/tutor/sessions" className={linkClass}>My Sessions</NavLink>
          <NavLink to="/tutor/earnings" className={linkClass}>Payments</NavLink>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </>
      );
    }
    if (user?.role === 'admin') {
      return (
        <>
          <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </>
      );
    }
    return null;
  };

  const renderMobileNav = () => {
    if (!isAuthenticated) {
      return (
        <>
          <NavLink to="/tutors" className={mobileLinkClass} onClick={close}>Find Tutors</NavLink>
          <NavLink to="/login" className={mobileLinkClass} onClick={close}>Sign In</NavLink>
          <Link to="/register" className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md" onClick={close}>
            Get Started
          </Link>
        </>
      );
    }
    if (user?.role === 'student') {
      return (
        <>
          <NavLink to="/student/dashboard" className={mobileLinkClass} onClick={close}>Dashboard</NavLink>
          <NavLink to="/tutors" className={mobileLinkClass} onClick={close}>Find Tutors</NavLink>
          <NavLink to="/student/bookings" className={mobileLinkClass} onClick={close}>My Bookings</NavLink>
          <NavLink to="/student/profile" className={mobileLinkClass} onClick={close}>Profile</NavLink>
          <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Logout</button>
        </>
      );
    }
    if (user?.role === 'tutor') {
      return (
        <>
          <NavLink to="/tutor/dashboard" className={mobileLinkClass} onClick={close}>Dashboard</NavLink>
          <NavLink to="/tutor/profile" className={mobileLinkClass} onClick={close}>My Profile</NavLink>
          <NavLink to="/tutor/fellow-tutors" className={mobileLinkClass} onClick={close}>Fellow Tutors</NavLink>
          <NavLink to="/tutor/sessions" className={mobileLinkClass} onClick={close}>My Sessions</NavLink>
          <NavLink to="/tutor/earnings" className={mobileLinkClass} onClick={close}>Payments</NavLink>
          <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Logout</button>
        </>
      );
    }
    if (user?.role === 'admin') {
      return (
        <>
          <NavLink to="/admin/dashboard" className={mobileLinkClass} onClick={close}>Dashboard</NavLink>
          <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Logout</button>
        </>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Lugha<span className="text-blue-600">Pro</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {renderDesktopNav()}
          </nav>

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {renderMobileNav()}
          </div>
        )}
      </div>
    </header>
  );
}
