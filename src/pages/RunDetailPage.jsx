import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { runAPI } from '../services/api';
import Navbar from '../components/Navbar';

const statusColors = {
    SUCCESS: { bg: '#dcfce7', text: '#166534', icon: '✅' },
    FAILED: { bg: '#fef2f2', text: '#dc2626', icon: '❌' },
    PENDING: { bg: '#fef9c3', text: '#854d0e', icon: '⏳' },
    SKIPPED: { bg: '#f1f5f9', text: '#475569', icon: '⏭' }
};

const nodeTypeIcons = {
    HTTP: '🌐',
    CONDITION: '🔀',
    AI: '✨',
    NOTIFY: '🔔',
    DELAY: '⏱'
};

const RunDetailPage = () => {

    const { runId } = useParams();
    const navigate = useNavigate();

    const [run, setRun] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedNode, setExpandedNode] = useState(null);
    const [activeTab, setActiveTab] = useState({});

    useEffect(() => {
        fetchRunDetails();
    }, [runId]);

    const fetchRunDetails = async () => {
        try {
            setLoading(true);
            const [runRes, logsRes] = await Promise.all([
                runAPI.getRunById(runId),
                runAPI.getNodeLogs(runId)
            ]);
            setRun(runRes.data.data);
            setLogs(logsRes.data.data);
        } catch (err) {
            console.error('Failed to load run details');
        } finally {
            setLoading(false);
        }
    };

    const formatJson = (jsonStr) => {
        try {
            return JSON.stringify(JSON.parse(jsonStr), null, 2);
        } catch {
            return jsonStr || 'null';
        }
    };

    const toggleNode = (nodeId) => {
        setExpandedNode(
            expandedNode === nodeId ? null : nodeId
        );
    };

    const setTab = (nodeId, tab) => {
        setActiveTab({ ...activeTab, [nodeId]: tab });
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.loading}>Loading run details...</div>
            </div>
        );
    }

    if (!run) return null;

    const runStatus = statusColors[run.status] || statusColors.PENDING;

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <button
                        style={styles.backBtn}
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 style={styles.title}>
                            Run Details
                        </h1>
                        <p style={styles.subtitle}>
                            {run.workflowName}
                        </p>
                    </div>
                </div>

                {/* Run summary card */}
                <div style={styles.summaryCard}>
                    <div style={styles.summaryLeft}>
                        <span style={{
                            ...styles.bigStatus,
                            backgroundColor: runStatus.bg,
                            color: runStatus.text
                        }}>
                            {runStatus.icon} {run.status}
                        </span>
                        <div style={styles.summaryInfo}>
                            <div style={styles.infoItem}>
                                <span style={styles.infoLabel}>
                                    Started
                                </span>
                                <span style={styles.infoValue}>
                                    {new Date(run.startedAt)
                                        .toLocaleString('en-IN')}
                                </span>
                            </div>
                            {run.endedAt && (
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Duration
                                    </span>
                                    <span style={styles.infoValue}>
                                        {run.durationMs}ms
                                    </span>
                                </div>
                            )}
                            <div style={styles.infoItem}>
                                <span style={styles.infoLabel}>
                                    Trigger
                                </span>
                                <span style={styles.infoValue}>
                                    {run.triggerType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Node counts */}
                    <div style={styles.nodeCounts}>
                        <div style={styles.countItem}>
                            <span style={styles.countNum}>
                                {run.totalNodes}
                            </span>
                            <span style={styles.countLabel}>
                                Total
                            </span>
                        </div>
                        <div style={styles.countItem}>
                            <span style={{
                                ...styles.countNum,
                                color: '#22c55e'
                            }}>
                                {run.successNodes}
                            </span>
                            <span style={styles.countLabel}>
                                Passed
                            </span>
                        </div>
                        <div style={styles.countItem}>
                            <span style={{
                                ...styles.countNum,
                                color: '#ef4444'
                            }}>
                                {run.failedNodes}
                            </span>
                            <span style={styles.countLabel}>
                                Failed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Node logs */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        Node Execution Logs
                    </h2>

                    {logs.length === 0 ? (
                        <div style={styles.emptyLogs}>
                            No node logs found for this run.
                        </div>
                    ) : (
                        <div style={styles.nodeList}>
                            {logs.map((log, index) => {
                                const nodeStatus =
                                    statusColors[log.status]
                                    || statusColors.PENDING;
                                const isExpanded =
                                    expandedNode === log.id;
                                const currentTab =
                                    activeTab[log.id] || 'output';
                                const nodeIcon =
                                    nodeTypeIcons[log.nodeType] || '📦';

                                return (
                                    <div
                                        key={log.id}
                                        style={styles.nodeCard}
                                    >
                                        {/* Node header — clickable */}
                                        <div
                                            style={styles.nodeHeader}
                                            onClick={() =>
                                                toggleNode(log.id)
                                            }
                                        >
                                            <div style={styles.nodeLeft}>
                                                {/* Step number */}
                                                <div style={styles.stepNum}>
                                                    {index + 1}
                                                </div>

                                                {/* Icon + type */}
                                                <span style={styles.nodeIcon}>
                                                    {nodeIcon}
                                                </span>
                                                <div>
                                                    <div style={
                                                        styles.nodeType
                                                    }>
                                                        {log.nodeType} Node
                                                    </div>
                                                    <div style={
                                                        styles.nodeIdText
                                                    }>
                                                        {log.nodeId}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={styles.nodeRight}>
                                                {/* Duration */}
                                                {log.durationMs && (
                                                    <span style={
                                                        styles.duration
                                                    }>
                                                        {log.durationMs}ms
                                                    </span>
                                                )}

                                                {/* Status badge */}
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor:
                                                        nodeStatus.bg,
                                                    color: nodeStatus.text
                                                }}>
                                                    {nodeStatus.icon}{' '}
                                                    {log.status}
                                                </span>

                                                {/* Expand arrow */}
                                                <span style={styles.arrow}>
                                                    {isExpanded ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Error message — always visible
                                            if failed */}
                                        {log.status === 'FAILED'
                                            && log.errorMessage && (
                                            <div style={styles.errorMsg}>
                                                ⚠️ {log.errorMessage}
                                            </div>
                                        )}

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div style={styles.nodeBody}>

                                                {/* Tabs */}
                                                <div style={styles.tabs}>
                                                    {['input',
                                                      'output',
                                                      'raw'
                                                    ].map(tab => (
                                                        <button
                                                            key={tab}
                                                            style={{
                                                                ...styles.tab,
                                                                ...(currentTab
                                                                    === tab
                                                                    ? styles
                                                                        .tabActive
                                                                    : {})
                                                            }}
                                                            onClick={() =>
                                                                setTab(
                                                                    log.id,
                                                                    tab
                                                                )
                                                            }
                                                        >
                                                            {tab === 'input'
                                                                && '📥 Input'}
                                                            {tab === 'output'
                                                                && '📤 Output'}
                                                            {tab === 'raw'
                                                                && '🔍 Raw'}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Tab content */}
                                                <div style={styles.tabContent}>
                                                    {currentTab === 'input'
                                                        && (
                                                        <pre style={
                                                            styles.jsonBlock
                                                        }>
                                                            {formatJson(
                                                                log.inputJson
                                                            )}
                                                        </pre>
                                                    )}
                                                    {currentTab === 'output'
                                                        && (
                                                        <pre style={
                                                            styles.jsonBlock
                                                        }>
                                                            {log.outputJson
                                                                ? formatJson(
                                                                    log.outputJson
                                                                )
                                                                : log.errorMessage
                                                                    || 'No output'
                                                            }
                                                        </pre>
                                                    )}
                                                    {currentTab === 'raw'
                                                        && (
                                                        <div>
                                                            <div style={
                                                                styles.rawItem
                                                            }>
                                                                <strong>
                                                                    Node ID:
                                                                </strong>{' '}
                                                                {log.nodeId}
                                                            </div>
                                                            <div style={
                                                                styles.rawItem
                                                            }>
                                                                <strong>
                                                                    Type:
                                                                </strong>{' '}
                                                                {log.nodeType}
                                                            </div>
                                                            <div style={
                                                                styles.rawItem
                                                            }>
                                                                <strong>
                                                                    Status:
                                                                </strong>{' '}
                                                                {log.status}
                                                            </div>
                                                            <div style={
                                                                styles.rawItem
                                                            }>
                                                                <strong>
                                                                    Duration:
                                                                </strong>{' '}
                                                                {log.durationMs}ms
                                                            </div>
                                                            <div style={
                                                                styles.rawItem
                                                            }>
                                                                <strong>
                                                                    Executed:
                                                                </strong>{' '}
                                                                {new Date(
                                                                    log.executedAt
                                                                ).toLocaleString(
                                                                    'en-IN'
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Connector line between nodes */}
                                        {index < logs.length - 1 && (
                                            <div style={styles.connector}>
                                                |
                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

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
        maxWidth: '900px',
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
        marginBottom: '24px'
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
    summaryCard: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    summaryLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    bigStatus: {
        fontSize: '14px',
        fontWeight: '600',
        padding: '8px 16px',
        borderRadius: '20px',
        whiteSpace: 'nowrap'
    },
    summaryInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    infoItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    infoLabel: {
        fontSize: '12px',
        color: '#94a3b8',
        minWidth: '60px'
    },
    infoValue: {
        fontSize: '13px',
        color: '#374151',
        fontWeight: '500'
    },
    nodeCounts: {
        display: 'flex',
        gap: '24px'
    },
    countItem: {
        textAlign: 'center'
    },
    countNum: {
        display: 'block',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
    },
    countLabel: {
        fontSize: '12px',
        color: '#64748b'
    },
    section: {
        marginTop: '8px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px'
    },
    emptyLogs: {
        textAlign: 'center',
        padding: '40px',
        color: '#64748b',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    },
    nodeList: {
        display: 'flex',
        flexDirection: 'column'
    },
    nodeCard: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden'
    },
    nodeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        cursor: 'pointer',
        userSelect: 'none'
    },
    nodeLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    stepNum: {
        width: '26px',
        height: '26px',
        backgroundColor: '#f1f5f9',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#475569',
        flexShrink: 0
    },
    nodeIcon: {
        fontSize: '18px'
    },
    nodeType: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
    },
    nodeIdText: {
        fontSize: '11px',
        color: '#94a3b8',
        fontFamily: 'monospace'
    },
    nodeRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    duration: {
        fontSize: '12px',
        color: '#94a3b8',
        fontFamily: 'monospace'
    },
    statusBadge: {
        fontSize: '12px',
        fontWeight: '600',
        padding: '3px 10px',
        borderRadius: '12px'
    },
    arrow: {
        fontSize: '10px',
        color: '#94a3b8'
    },
    errorMsg: {
        backgroundColor: '#fef2f2',
        borderTop: '1px solid #fecaca',
        padding: '10px 16px',
        fontSize: '13px',
        color: '#dc2626'
    },
    nodeBody: {
        borderTop: '1px solid #f1f5f9',
        padding: '16px'
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        marginBottom: '12px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px'
    },
    tab: {
        padding: '6px 14px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
        color: '#64748b',
        fontWeight: '500'
    },
    tabActive: {
        backgroundColor: '#eff6ff',
        color: '#3b82f6'
    },
    tabContent: {
        maxHeight: '400px',
        overflowY: 'auto'
    },
    jsonBlock: {
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        lineHeight: '1.6',
        overflow: 'auto',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
    },
    rawItem: {
        padding: '6px 0',
        fontSize: '13px',
        color: '#374151',
        borderBottom: '1px solid #f1f5f9'
    },
    connector: {
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: '18px',
        padding: '4px 0',
        lineHeight: 1
    }
};

export default RunDetailPage;