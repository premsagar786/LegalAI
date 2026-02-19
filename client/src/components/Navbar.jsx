import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Sun,
    Moon,
    Scale,
    Menu,
    X,
    User,
    LogOut,
    FileText,
    Calendar,
    LayoutDashboard
} from 'lucide-react';
import Notifications from './Notifications';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [profileOpen, setProfileOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setProfileOpen(false);
    };

    const getDashboardLink = () => {
        if (!user) return '/dashboard';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'lawyer': return '/lawyer-dashboard';
            default: return '/dashboard';
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">
                        <Scale size={28} />
                    </div>
                    <span className="logo-text">LegalAI</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/lawyers" className="nav-link">Find Lawyers</Link>
                    <Link to="/analyze" className="nav-link">Analyze Document</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </div>

                {/* Right Side */}
                <div className="navbar-actions">
                    {/* Notifications - Only for authenticated users */}
                    {isAuthenticated && <Notifications />}

                    {/* Theme Toggle */}
                    <motion.button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>

                    {isAuthenticated ? (
                        <div className="profile-dropdown">
                            <button
                                className="profile-button"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="profile-avatar">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="profile-name">{user?.name?.split(' ')[0]}</span>
                            </button>

                            {profileOpen && (
                                <motion.div
                                    className="dropdown-menu"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="dropdown-header">
                                        <p className="dropdown-name">{user?.name}</p>
                                        <p className="dropdown-email">{user?.email}</p>
                                        <span className={`role-badge role-${user?.role}`}>
                                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                        </span>
                                    </div>

                                    <div className="dropdown-divider" />

                                    <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>
                                    <Link to="/documents" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                        <FileText size={18} />
                                        My Documents
                                    </Link>
                                    <Link to="/appointments" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                        <Calendar size={18} />
                                        Appointments
                                    </Link>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                                        <User size={18} />
                                        Profile
                                    </Link>

                                    <div className="dropdown-divider" />

                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-secondary btn-sm">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <motion.div
                    className="mobile-menu"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/lawyers" className="mobile-link" onClick={() => setMenuOpen(false)}>Find Lawyers</Link>
                    <Link to="/analyze" className="mobile-link" onClick={() => setMenuOpen(false)}>Analyze Document</Link>
                    <Link to="/about" className="mobile-link" onClick={() => setMenuOpen(false)}>About</Link>

                    {!isAuthenticated && (
                        <div className="mobile-auth">
                            <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
                        </div>
                    )}
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
