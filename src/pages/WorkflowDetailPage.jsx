import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowAPI } from '../services/api';
import Navbar from '../components/Navbar';

const statusColors = {
    SUCCESS: { bg: '#dcfce7', text: '#166534' },
    FAILED: { bg: '#fef2f2', text: '#dc2626' },
    PENDING: { bg: '#fef9c3', text: '#854d0e' },
    RUNNING: { bg: '#eff6ff', text: '#1d4ed8' }
};

const triggerIcons = {
    WEBHOOK: '🔗',
    CRON: '⏰',
    MANUAL: '▶️'
};

const WorkflowDetailPage = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [workflow, setWorkflow] = useState(null);
    const [runs, setRuns] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id, page]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wfRes, runsRes, statsRes] = await Promise.all([
                workflowAPI.getById(id),
                workflowAPI.getRuns(id, page, 10),
                workflowAPI.getStats(id)
            ]);

            setWorkflow(wfRes.data.data);
            setRuns(runsRes.data.data.content);
            setTotalPages(runsRes.data.data.totalPages);
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Failed to load workflow details');
        } finally {
            setLoading(false);
        }
    };

    const copyWebhookUrl = () => {
        if (!workflow?.webhookKey) return;
        const url = `http://localhost:8080/api/webhook/${id}?key=${workflow.webhookKey}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (!workflow) return null;

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <button
                        style={styles.backBtn}
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 style={styles.title}>{workflow.name}</h1>
                        <p style={styles.subtitle}>
                            {workflow.description}
                        </p>
                    </div>
                    <span style={{
                        ...styles.badge,
                        backgroundColor:
                            workflow.status === 'PUBLISHED'
                                ? '#dcfce7' : '#fef9c3',
                        color:
                            workflow.status === 'PUBLISHED'
                                ? '#166534' : '#854d0e'
                    }}>
                        {workflow.status}
                    </span>
                </div>

                <div style={styles.layout}>

                    {/* Left — workflow info */}
                    <div style={styles.leftPanel}>

                        {/* Webhook URL card */}
                        {workflow.status === 'PUBLISHED'
                            && workflow.triggerType === 'WEBHOOK' && (
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>
                                    🔗 Webhook Trigger
                                </h3>
                                <p style={styles.cardSubtitle}>
                                    Send a POST request to this URL
                                    to trigger the workflow
                                </p>
                                <div style={styles.urlBox}>
                                    <code style={styles.urlText}>
                                        POST /api/webhook/{id}
                                        ?key={workflow.webhookKey
                                            ?.substring(0, 12)}...
                                    </code>
                                </div>
                                <button
                                    style={styles.copyBtn}
                                    onClick={copyWebhookUrl}
                                >
                                    {copied
                                        ? '✓ Copied!'
                                        : '📋 Copy Full URL'}
                                </button>
                            </div>
                        )}

                        {/* Cron info */}
                        {workflow.triggerType === 'CRON' && (
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>
                                    ⏰ Cron Schedule
                                </h3>
                                <code style={styles.cronCode}>
                                    {workflow.cronString}
                                </code>
                            </div>
                        )}

                        {/* Stats card */}
                        {stats && (
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>
                                    📊 Execution Stats
                                </h3>
                                <div style={styles.statGrid}>
                                    <div style={styles.statItem}>
                                        <div style={styles.statNum}>
                                            {stats.totalRuns}
                                        </div>
                                        <div style={styles.statLbl}>
                                            Total Runs
                                        </div>
                                    </div>
                                    <div style={styles.statItem}>
                                        <div style={{
                                            ...styles.statNum,
                                            color: '#22c55e'
                                        }}>
                                            {stats.successRuns}
                                        </div>
                                        <div style={styles.statLbl}>
                                            Success
                                        </div>
                                    </div>
                                    <div style={styles.statItem}>
                                        <div style={{
                                            ...styles.statNum,
                                            color: '#ef4444'
                                        }}>
                                            {stats.failedRuns}
                                        </div>
                                        <div style={styles.statLbl}>
                                            Failed
                                        </div>
                                    </div>
                                    <div style={styles.statItem}>
                                        <div style={{
                                            ...styles.statNum,
                                            color: '#3b82f6'
                                        }}>
                                            {stats.successRate}
                                        </div>
                                        <div style={styles.statLbl}>
                                            Success Rate
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right — run history */}
                    <div style={styles.rightPanel}>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                🕐 Run History
                            </h3>

                            {runs.length === 0 ? (
                                <div style={styles.emptyRuns}>
                                    <p>No runs yet.</p>
                                    <p style={{ fontSize: '13px',
                                        color: '#94a3b8' }}>
                                        Trigger the webhook to see
                                        executions here.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {runs.map(run => {
                                        const sc = statusColors[
                                            run.status
                                        ] || statusColors.PENDING;
                                        return (
                                            <div
                                                key={run.id}
                                                style={styles.runItem}
                                                onClick={() => navigate(
                                                    `/runs/${run.id}`
                                                )}
                                            >
                                                <div style={styles.runLeft}>
                                                    <span style={{
                                                        ...styles.runStatus,
                                                        backgroundColor: sc.bg,
                                                        color: sc.text
                                                    }}>
                                                        {run.status}
                                                    </span>
                                                    <div>
                                                        <div style={
                                                            styles.runDate
                                                        }>
                                                            {new Date(
                                                                run.startedAt
                                                            ).toLocaleString(
                                                                'en-IN'
                                                            )}
                                                        </div>
                                                        <div style={
                                                            styles.runMeta
                                                        }>
                                                            {triggerIcons[
                                                                run.triggerType
                                                            ]} {run.triggerType}
                                                            {run.durationMs &&
                                                                ` · ${run.durationMs}ms`
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={styles.runNodes}>
                                                    <span style={
                                                        styles.nodeCount
                                                    }>
                                                        ✅ {run.successNodes}
                                                    </span>
                                                    {run.failedNodes > 0 && (
                                                        <span style={{
                                                            ...styles.nodeCount,
                                                            color: '#ef4444'
                                                        }}>
                                                            ❌ {run.failedNodes}
                                                        </span>
                                                    )}
                                                    <span style={
                                                        styles.viewLink
                                                    }>
                                                        View →
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div style={styles.pagination}>
                                            <button
                                                style={styles.pageBtn}
                                                onClick={() =>
                                                    setPage(p => p - 1)
                                                }
                                                disabled={page === 0}
                                            >
                                                ← Previous
                                            </button>
                                            <span style={styles.pageInfo}>
                                                Page {page + 1} of {totalPages}
                                            </span>
                                            <button
                                                style={styles.pageBtn}
                                                onClick={() =>
                                                    setPage(p => p + 1)
                                                }
                                                disabled={
                                                    page === totalPages - 1
                                                }
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        color: '#64748b'
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '28px'
    },
    backBtn: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#374151',
        whiteSpace: 'nowrap'
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 4px 0'
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    },
    badge: {
        fontSize: '12px',
        fontWeight: '500',
        padding: '4px 12px',
        borderRadius: '20px',
        whiteSpace: 'nowrap',
        marginLeft: 'auto'
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '20px',
        alignItems: 'start'
    },
    leftPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    rightPanel: {},
    card: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px'
    },
    cardTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 8px 0'
    },
    cardSubtitle: {
        fontSize: '13px',
        color: '#64748b',
        margin: '0 0 12px 0'
    },
    urlBox: {
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '10px',
        overflowX: 'auto'
    },
    urlText: {
        fontSize: '12px',
        color: '#374151',
        fontFamily: 'monospace'
    },
    copyBtn: {
        width: '100%',
        padding: '8px',
        backgroundColor: '#eff6ff',
        color: '#3b82f6',
        border: '1px solid #bfdbfe',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    cronCode: {
        display: 'block',
        backgroundColor: '#f8fafc',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#374151'
    },
    statGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '8px'
    },
    statItem: { textAlign: 'center' },
    statNum: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
    },
    statLbl: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '2px'
    },
    emptyRuns: {
        textAlign: 'center',
        padding: '40px',
        color: '#64748b'
    },
    runItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px',
        borderBottom: '1px solid #f1f5f9',
        cursor: 'pointer',
        borderRadius: '8px',
        transition: 'background 0.15s'
    },
    runLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    runStatus: {
        fontSize: '11px',
        fontWeight: '600',
        padding: '3px 8px',
        borderRadius: '12px'
    },
    runDate: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#1e293b'
    },
    runMeta: {
        fontSize: '12px',
        color: '#94a3b8',
        marginTop: '2px'
    },
    runNodes: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    nodeCount: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#22c55e'
    },
    viewLink: {
        fontSize: '13px',
        color: '#3b82f6',
        fontWeight: '500'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9'
    },
    pageBtn: {
        padding: '7px 14px',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
        color: '#374151'
    },
    pageInfo: {
        fontSize: '13px',
        color: '#64748b'
    }
};

export default WorkflowDetailPage;