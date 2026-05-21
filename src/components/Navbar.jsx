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

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>

                {/* Logo */}
                <Link to="/dashboard" style={styles.logo}>
                    ⚡ Flow
                </Link>

                {/* Navigation links */}
                <div style={styles.links}>
                    <Link
                        to="/dashboard"
                        style={{
                            ...styles.link,
                            ...(isActive('/dashboard')
                                ? styles.activeLink : {})
                        }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/runs"
                        style={{
                            ...styles.link,
                            ...(isActive('/runs')
                                ? styles.activeLink : {})
                        }}
                    >
                        Run History
                    </Link>
                </div>

                {/* User info + logout */}
                <div style={styles.userSection}>
                    <span style={styles.userName}>
                        {user?.name}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={styles.logoutBtn}
                    >
                        Logout
                    </button>
                </div>

            </div>
        </nav>
    );
};

const styles = {
    nav: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px'
    },
    logo: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#3b82f6',
        textDecoration: 'none'
    },
    links: {
        display: 'flex',
        gap: '24px'
    },
    link: {
        fontSize: '14px',
        color: '#64748b',
        textDecoration: 'none',
        fontWeight: '500',
        padding: '4px 0',
        borderBottom: '2px solid transparent'
    },
    activeLink: {
        color: '#3b82f6',
        borderBottom: '2px solid #3b82f6'
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    userName: {
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500'
    },
    logoutBtn: {
        padding: '6px 14px',
        backgroundColor: 'transparent',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#64748b',
        cursor: 'pointer'
    }
};

export default Navbar;