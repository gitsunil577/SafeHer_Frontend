import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
          <li><Link to="/register" className={isActive('/register')}>Register</Link></li>
          <li><Link to="/volunteer/register" className={isActive('/volunteer/register')}>Volunteer</Link></li>
        </>
      );
    }

    switch (user.role) {
      case 'user':
        return (
          <>
            <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
            <li><Link to="/profile" className={isActive('/profile')}>Profile</Link></li>
            <li><Link to="/contacts" className={isActive('/contacts')}>Contacts</Link></li>
            <li><Link to="/history" className={isActive('/history')}>History</Link></li>
            <li><button onClick={logout} className="nav-link">Logout</button></li>
          </>
        );
      case 'volunteer':
        return (
          <>
            <li><Link to="/volunteer/dashboard" className={isActive('/volunteer/dashboard')}>Dashboard</Link></li>
            <li><Link to="/volunteer/alerts" className={isActive('/volunteer/alerts')}>Alerts</Link></li>
            <li><Link to="/volunteer/profile" className={isActive('/volunteer/profile')}>Profile</Link></li>
            <li><button onClick={logout} className="nav-link">Logout</button></li>
          </>
        );
      case 'admin':
        return (
          <>
            <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Dashboard</Link></li>
            <li><Link to="/admin/users" className={isActive('/admin/users')}>Users</Link></li>
            <li><Link to="/admin/volunteers" className={isActive('/admin/volunteers')}>Volunteers</Link></li>
            <li><Link to="/admin/alerts" className={isActive('/admin/alerts')}>Alerts</Link></li>
            <li><Link to="/admin/reports" className={isActive('/admin/reports')}>Reports</Link></li>
            <li><button onClick={logout} className="nav-link">Logout</button></li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span>SafeHer</span>
        </Link>
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
        <ul className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          {renderNavLinks()}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
