import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, BookOpen, ChevronDown } from 'lucide-react';
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

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,248,243,0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(11,94,71,0.08)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" onClick={close} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          fontFamily: 'var(--font-display)', fontSize: '1.5rem',
          fontWeight: 700, color: 'var(--forest)', textDecoration: 'none',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--amber)', flexShrink: 0,
          }} />
          LughaPro
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
          {!isAuthenticated && (
            <>
              <NavLink to="/tutors" style={({ isActive }) => navLinkStyle(isActive)}>Find Tutors</NavLink>
              <a href="#pricing" style={navLinkStyle(false)}>Pricing</a>
              <NavLink to="/login" style={({ isActive }) => navLinkStyle(isActive)}>Sign In</NavLink>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <NavLink to="/student/dashboard" style={({ isActive }) => navLinkStyle(isActive)}>Dashboard</NavLink>
              <NavLink to="/tutors" style={({ isActive }) => navLinkStyle(isActive)}>Find Tutors</NavLink>
              <NavLink to="/student/bookings" style={({ isActive }) => navLinkStyle(isActive)}>My Sessions</NavLink>
            </>
          )}
          {user?.role === 'tutor' && (
            <>
              <NavLink to="/tutor/dashboard" style={({ isActive }) => navLinkStyle(isActive)}>Dashboard</NavLink>
              <NavLink to="/tutor/sessions" style={({ isActive }) => navLinkStyle(isActive)}>My Sessions</NavLink>
              <NavLink to="/tutor/earnings" style={({ isActive }) => navLinkStyle(isActive)}>Earnings</NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin/dashboard" style={({ isActive }) => navLinkStyle(isActive)}>Admin Panel</NavLink>
          )}
        </nav>

        {/* Desktop Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-ghost" style={{ padding: '0.45rem 1.25rem', fontSize: '0.875rem' }}>
                Log in
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.875rem' }}>
                Get started
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* User badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.4rem 1rem', borderRadius: '40px',
                background: 'var(--pale)', border: '1.5px solid rgba(61,191,160,0.3)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--jade)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: 'white',
                }}>
                  {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--forest)' }}>
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                  borderRadius: '4px', background: 'var(--forest)', color: 'white',
                  textTransform: 'capitalize',
                }}>
                  {user?.role}
                </span>
              </div>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.45rem 1rem', borderRadius: '40px',
                fontSize: '0.82rem', fontWeight: 500,
                color: 'var(--slate)', background: 'transparent',
                border: '1.5px solid var(--fog)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--rust)'; e.currentTarget.style.borderColor = 'var(--rust)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate)'; e.currentTarget.style.borderColor = 'var(--fog)'; }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', padding: '0.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--slate)',
          }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          background: 'var(--cream)',
          borderTop: '1px solid var(--sand)',
          borderBottom: '1px solid var(--sand)',
          padding: '1rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {!isAuthenticated && (
            <>
              <MobileLink to="/tutors" onClick={close}>Find Tutors</MobileLink>
              <MobileLink to="/login" onClick={close}>Sign In</MobileLink>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Link to="/register" onClick={close} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Get started
                </Link>
              </div>
            </>
          )}
          {isAuthenticated && user?.role === 'student' && (
            <>
              <MobileLink to="/student/dashboard" onClick={close}>Dashboard</MobileLink>
              <MobileLink to="/tutors" onClick={close}>Find Tutors</MobileLink>
              <MobileLink to="/student/bookings" onClick={close}>My Sessions</MobileLink>
              <MobileLink to="/student/profile" onClick={close}>Profile</MobileLink>
              <button onClick={handleLogout} style={mobileLogoutStyle}>Sign out</button>
            </>
          )}
          {isAuthenticated && user?.role === 'tutor' && (
            <>
              <MobileLink to="/tutor/dashboard" onClick={close}>Dashboard</MobileLink>
              <MobileLink to="/tutor/sessions" onClick={close}>My Sessions</MobileLink>
              <MobileLink to="/tutor/earnings" onClick={close}>Earnings</MobileLink>
              <MobileLink to="/tutor/profile" onClick={close}>My Profile</MobileLink>
              <button onClick={handleLogout} style={mobileLogoutStyle}>Sign out</button>
            </>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <MobileLink to="/admin/dashboard" onClick={close}>Admin Panel</MobileLink>
              <button onClick={handleLogout} style={mobileLogoutStyle}>Sign out</button>
            </>
          )}
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'block', padding: '0.75rem 1rem',
      fontSize: '0.9rem', fontWeight: 500, color: 'var(--slate)',
      borderRadius: '10px', textDecoration: 'none',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--pale)'; e.currentTarget.style.color = 'var(--forest)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--slate)'; }}
    >
      {children}
    </Link>
  );
}

const navLinkStyle = (isActive) => ({
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? 'var(--forest)' : 'var(--slate)',
  textDecoration: 'none',
  transition: 'color 0.2s',
  cursor: 'pointer',
});

const mobileLogoutStyle = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '0.75rem 1rem', marginTop: '0.25rem',
  fontSize: '0.875rem', fontWeight: 500, color: 'var(--rust)',
  background: 'none', border: 'none', cursor: 'pointer',
  borderRadius: '10px',
};