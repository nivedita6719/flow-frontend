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

    // Load workflows on mount
    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const response = await workflowAPI.getAll();
            setWorkflows(response.data.data);
        } catch (err) {
            setError('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (workflowId) => {
        try {
            await workflowAPI.publish(workflowId);
            setSuccessMsg('Workflow published successfully');
            fetchWorkflows(); // Refresh list
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Publish failed'
            );
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (workflowId) => {
        if (!window.confirm(
            'Delete this workflow? This cannot be undone.')) {
            return;
        }
        try {
            await workflowAPI.delete(workflowId);
            setSuccessMsg('Workflow deleted');
            fetchWorkflows();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Delete failed');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Stats from workflows
    const stats = {
        total: workflows.length,
        published: workflows.filter(
            w => w.status === 'PUBLISHED').length,
        draft: workflows.filter(
            w => w.status === 'DRAFT').length
    };

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>

                {/* Welcome header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.heading}>
                            Welcome back, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p style={styles.subheading}>
                            Manage and monitor your workflows
                        </p>
                    </div>
                    <button
                        style={styles.createBtn}
                        onClick={() => navigate('/workflows/new')}
                    >
                        + Create Workflow
                    </button>
                </div>

                {/* Stats row */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>
                            {stats.total}
                        </div>
                        <div style={styles.statLabel}>
                            Total Workflows
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{
                            ...styles.statNumber,
                            color: '#22c55e'
                        }}>
                            {stats.published}
                        </div>
                        <div style={styles.statLabel}>Published</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{
                            ...styles.statNumber,
                            color: '#f59e0b'
                        }}>
                            {stats.draft}
                        </div>
                        <div style={styles.statLabel}>Draft</div>
                    </div>
                </div>

                {/* Messages */}
                {successMsg && (
                    <div style={styles.successBox}>{successMsg}</div>
                )}
                {error && (
                    <div style={styles.errorBox}>{error}</div>
                )}

                {/* Workflow list */}
                {loading ? (
                    <div style={styles.loading}>
                        Loading workflows...
                    </div>
                ) : workflows.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>⚡</div>
                        <h3 style={styles.emptyTitle}>
                            No workflows yet
                        </h3>
                        <p style={styles.emptyText}>
                            Create your first workflow to start automating
                        </p>
                        <button
                            style={styles.createBtn}
                            onClick={() => navigate('/workflows/new')}
                        >
                            Create your first workflow
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {workflows.map(workflow => (
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

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px'
    },
    heading: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#1e293b',
        margin: 0,
        marginBottom: '6px'
    },
    subheading: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    },
    createBtn: {
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    statsRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '28px'
    },
    statCard: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px 28px',
        textAlign: 'center',
        minWidth: '120px'
    },
    statNumber: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1e293b'
    },
    statLabel: {
        fontSize: '13px',
        color: '#64748b',
        marginTop: '4px'
    },
    successBox: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#166534',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        color: '#64748b',
        fontSize: '16px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px'
    },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '8px'
    },
    emptyText: {
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '24px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
    }
};

export default DashboardPage;