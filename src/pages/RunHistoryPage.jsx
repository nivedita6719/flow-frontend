import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { runAPI } from '../services/api';
import Navbar from '../components/Navbar';

const badgeClass = {
    SUCCESS: 'fl-badge fl-badge--success',
    FAILED: 'fl-badge fl-badge--failed',
    PENDING: 'fl-badge fl-badge--pending',
    RUNNING: 'fl-badge fl-badge--running'
};

const triggerIcon = { WEBHOOK: '🔗', CRON: '⏰', MANUAL: '▶️' };

const PAGE_SIZE = 20;

const RunHistoryPage = () => {

    const navigate = useNavigate();

    const [runs, setRuns] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRuns = useCallback(async () => {
        try {
            setLoading(true);
            const res = await runAPI.getAllRuns(page, PAGE_SIZE);
            setRuns(res.data.data.content || []);
            setTotalPages(res.data.data.totalPages || 0);
            setError('');
        } catch (err) {
            setError(err.friendlyMessage || 'Failed to load run history');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchRuns(); }, [fetchRuns]);

    return (
        <div className="fl-page">
            <Navbar />
            <div className="fl-container">

                <div className="fl-head">
                    <div>
                        <h1 className="fl-head__title">Run History</h1>
                        <p className="fl-head__sub">Every execution across all your workflows</p>
                    </div>
                    <button className="fl-btn--ghost" onClick={fetchRuns}>↻ Refresh</button>
                </div>

                {error && <div className="fl-alert fl-alert--error">{error}</div>}

                {loading ? (
                    <div className="fl-loading"><span className="fl-spinner" /> Loading runs…</div>
                ) : runs.length === 0 ? (
                    <div className="fl-empty">
                        <div className="fl-empty__icon">🕐</div>
                        <h3 className="fl-empty__title">No runs yet</h3>
                        <p className="fl-empty__text">
                            Trigger a published workflow (webhook, cron or test run) to see executions here.
                        </p>
                        <button className="fl-cta" onClick={() => navigate('/dashboard')}>
                            Go to workflows
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="fl-panel">
                            {runs.map((run) => (
                                <div
                                    key={run.id}
                                    className="fl-row"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => navigate(`/runs/${run.id}`)}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/runs/${run.id}`)}
                                >
                                    <div className="fl-row__main">
                                        <div className="fl-row__title">
                                            {run.workflowName || 'Workflow'}
                                        </div>
                                        <div className="fl-row__meta">
                                            {triggerIcon[run.triggerType] || '•'} {run.triggerType}
                                            {' · '}
                                            {run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}
                                            {run.durationMs != null && ` · ${run.durationMs}ms`}
                                        </div>
                                    </div>
                                    <div className="fl-row__right">
                                        <span className="fl-nodecount">
                                            ✓ {run.successNodes}
                                            {run.failedNodes > 0 && <>  ✕ {run.failedNodes}</>}
                                        </span>
                                        <span className={badgeClass[run.status] || 'fl-badge fl-badge--pending'}>
                                            {run.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="fl-pager">
                                <button
                                    className="fl-pager__btn"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                >
                                    ← Previous
                                </button>
                                <span>Page {page + 1} of {totalPages}</span>
                                <button
                                    className="fl-pager__btn"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RunHistoryPage;
