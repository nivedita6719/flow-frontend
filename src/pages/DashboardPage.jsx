import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import WorkflowCard from '../components/WorkflowCard';

const DashboardPage = () => {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const response = await workflowAPI.getAll();
            setWorkflows(response.data.data);
            setError('');
        } catch (err) {
            setError(err.friendlyMessage || 'Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const flash = (setter, msg) => {
        setter(msg);
        setTimeout(() => setter(''), 3000);
    };

    const handlePublish = async (workflowId) => {
        try {
            await workflowAPI.publish(workflowId);
            flash(setSuccessMsg, 'Workflow published successfully');
            fetchWorkflows();
        } catch (err) {
            flash(setError, err.friendlyMessage || err.response?.data?.message || 'Publish failed');
        }
    };

    const handleDelete = async (workflowId) => {
        if (!window.confirm('Delete this workflow? This cannot be undone.')) return;
        try {
            await workflowAPI.delete(workflowId);
            flash(setSuccessMsg, 'Workflow deleted');
            fetchWorkflows();
        } catch (err) {
            flash(setError, err.friendlyMessage || 'Delete failed');
        }
    };

    const stats = {
        total: workflows.length,
        published: workflows.filter((w) => w.status === 'PUBLISHED').length,
        draft: workflows.filter((w) => w.status === 'DRAFT').length
    };

    return (
        <div className="fl-page">
            <Navbar />

            <div className="fl-container">

                <div className="fl-head">
                    <div>
                        <h1 className="fl-head__title">
                            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
                        </h1>
                        <p className="fl-head__sub">Manage and monitor your workflows</p>
                    </div>
                    <button className="fl-cta" onClick={() => navigate('/workflows/new')}>
                        + Create Workflow
                    </button>
                </div>

                <div className="fl-stats">
                    <div className="fl-stat fl-stat--total">
                        <div className="fl-stat__row">
                            <span className="fl-stat__num">{stats.total}</span>
                            <span className="fl-stat__icon">🗂️</span>
                        </div>
                        <div className="fl-stat__label">Total Workflows</div>
                    </div>
                    <div className="fl-stat fl-stat--pub">
                        <div className="fl-stat__row">
                            <span className="fl-stat__num" style={{ color: 'var(--fl-success)' }}>
                                {stats.published}
                            </span>
                            <span className="fl-stat__icon">🚀</span>
                        </div>
                        <div className="fl-stat__label">Published</div>
                    </div>
                    <div className="fl-stat fl-stat--draft">
                        <div className="fl-stat__row">
                            <span className="fl-stat__num" style={{ color: 'var(--fl-warn)' }}>
                                {stats.draft}
                            </span>
                            <span className="fl-stat__icon">✏️</span>
                        </div>
                        <div className="fl-stat__label">Draft</div>
                    </div>
                </div>

                {successMsg && <div className="fl-alert fl-alert--success">{successMsg}</div>}
                {error && <div className="fl-alert fl-alert--error">{error}</div>}

                {loading ? (
                    <div className="fl-loading">
                        <span className="fl-spinner" /> Loading workflows…
                    </div>
                ) : workflows.length === 0 ? (
                    <div className="fl-empty">
                        <div className="fl-empty__icon">⚡</div>
                        <h3 className="fl-empty__title">No workflows yet</h3>
                        <p className="fl-empty__text">
                            Create your first workflow to start automating
                        </p>
                        <button className="fl-cta" onClick={() => navigate('/workflows/new')}>
                            Create your first workflow
                        </button>
                    </div>
                ) : (
                    <div className="fl-grid">
                        {workflows.map((workflow) => (
                            <WorkflowCard
                                key={workflow.id}
                                workflow={workflow}
                                onPublish={handlePublish}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default DashboardPage;
