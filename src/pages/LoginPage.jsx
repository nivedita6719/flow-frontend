import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [slow, setSlow] = useState(false);

    // If the request is slow, it's almost always the backend cold-starting.
    useEffect(() => {
        if (!loading) { setSlow(false); return; }
        const t = setTimeout(() => setSlow(true), 7000);
        return () => clearTimeout(t);
    }, [loading]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);
            const { token, userId, email, name } = response.data.data;
            login({ userId, email, name }, token);
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.friendlyMessage ||
                err.response?.data?.message ||
                'Login failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fl-auth">

            <aside className="fl-auth__brand">
                <div className="fl-auth__brandInner">
                    <div className="fl-auth__logo">
                        <span className="fl-auth__logoMark">⚡</span> Flow
                    </div>
                </div>

                <div className="fl-auth__brandInner">
                    <h1 className="fl-auth__headline">
                        Automate your work,<br />one workflow at a time.
                    </h1>
                    <p className="fl-auth__sub">
                        Connect triggers, actions and conditions — Flow runs them for you.
                    </p>
                    <ul className="fl-auth__features">
                        <li><span className="fl-auth__check">✓</span> Webhook &amp; scheduled (cron) triggers</li>
                        <li><span className="fl-auth__check">✓</span> HTTP, condition, AI and notify nodes</li>
                        <li><span className="fl-auth__check">✓</span> Async execution with automatic retries</li>
                        <li><span className="fl-auth__check">✓</span> Full run history &amp; per-node logs</li>
                    </ul>
                </div>

                <div className="fl-auth__foot">Built with Spring Boot · Redis · PostgreSQL</div>
            </aside>

            <main className="fl-auth__panel">
                <div className="fl-card">
                    <div className="fl-mobileLogo">⚡ Flow</div>

                    <h2 className="fl-card__title">Welcome back</h2>
                    <p className="fl-card__subtitle">Sign in to your account</p>

                    {error && <div className="fl-alert fl-alert--error">{error}</div>}
                    {loading && slow && (
                        <div className="fl-alert fl-alert--info">
                            Waking up the server… this can take up to a minute on the first request. Hang tight.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="fl-field">
                            <label className="fl-label">Email</label>
                            <input
                                className="fl-input"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="fl-field">
                            <label className="fl-label">Password</label>
                            <input
                                className="fl-input"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button className="fl-btn" type="submit" disabled={loading}>
                            {loading && <span className="fl-spinner" />}
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="fl-formFoot">
                        Don't have an account?{' '}
                        <Link to="/register" className="fl-link">Create one</Link>
                    </p>

                    <p className="fl-hint">
                        First request after a while can take up to a minute while the server wakes up.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
