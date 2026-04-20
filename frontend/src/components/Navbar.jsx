import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Lugha<span className="text-blue-600">Pro</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <NavLink to="/tutors" className={({ isActive }) => isActive ? 'text-blue-600' : 'hover:text-gray-900 transition-colors'}>
              Find Tutors
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'text-blue-600' : 'hover:text-gray-900 transition-colors'}>
              Sign In
            </NavLink>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <NavLink to="/tutors" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMenuOpen(false)}>
              Find Tutors
            </NavLink>
            <NavLink to="/login" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMenuOpen(false)}>
              Sign In
            </NavLink>
            <Link to="/register" className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
