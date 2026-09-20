import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [slow, setSlow] = useState(false);

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

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.register(formData);
            const { token, userId, email, name } = response.data.data;
            login({ userId, email, name }, token);
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.friendlyMessage ||
                err.response?.data?.message ||
                'Registration failed. Please try again.'
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
                        Start automating<br />in under a minute.
                    </h1>
                    <p className="fl-auth__sub">
                        Create an account and build your first workflow today — no credit card.
                    </p>
                    <ul className="fl-auth__features">
                        <li><span className="fl-auth__check">✓</span> Free to use</li>
                        <li><span className="fl-auth__check">✓</span> Webhook &amp; cron triggers out of the box</li>
                        <li><span className="fl-auth__check">✓</span> Retry queue &amp; dead-letter handling</li>
                        <li><span className="fl-auth__check">✓</span> Observability with node-level logs</li>
                    </ul>
                </div>

                <div className="fl-auth__foot">Built with Spring Boot · Redis · PostgreSQL</div>
            </aside>

            <main className="fl-auth__panel">
                <div className="fl-card">
                    <div className="fl-mobileLogo">⚡ Flow</div>

                    <h2 className="fl-card__title">Create account</h2>
                    <p className="fl-card__subtitle">Start automating your workflows</p>

                    {error && <div className="fl-alert fl-alert--error">{error}</div>}
                    {loading && slow && (
                        <div className="fl-alert fl-alert--info">
                            Waking up the server… this can take up to a minute on the first request. Hang tight.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="fl-field">
                            <label className="fl-label">Full name</label>
                            <input
                                className="fl-input"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Priya Sharma"
                                autoComplete="name"
                                required
                            />
                        </div>

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
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                required
                                minLength={6}
                            />
                        </div>

                        <button className="fl-btn" type="submit" disabled={loading}>
                            {loading && <span className="fl-spinner" />}
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="fl-formFoot">
                        Already have an account?{' '}
                        <Link to="/login" className="fl-link">Sign in</Link>
                    </p>

                    <p className="fl-hint">
                        First request after a while can take up to a minute while the server wakes up.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
