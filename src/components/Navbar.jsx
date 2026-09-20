import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

    return (
        <nav className="fl-nav">
            <div className="fl-nav__inner">

                <Link to="/dashboard" className="fl-nav__logo">
                    <span className="fl-nav__logoMark">⚡</span> Flow
                </Link>

                <div className="fl-nav__links">
                    <Link
                        to="/dashboard"
                        className={
                            'fl-nav__link' +
                            (isActive('/dashboard') ? ' fl-nav__link--active' : '')
                        }
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/runs"
                        className={
                            'fl-nav__link' +
                            (isActive('/runs') ? ' fl-nav__link--active' : '')
                        }
                    >
                        Run History
                    </Link>
                </div>

                <div className="fl-nav__user">
                    <span className="fl-nav__avatar">{initial}</span>
                    <span className="fl-nav__name">{user?.name}</span>
                    <button onClick={handleLogout} className="fl-btn--ghost">
                        Logout
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
