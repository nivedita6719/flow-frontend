import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusColors = {
    DRAFT: { bg: '#fef9c3', text: '#854d0e', label: 'Draft' },
    PUBLISHED: { bg: '#dcfce7', text: '#166534', label: 'Published' },
    PAUSED: { bg: '#f1f5f9', text: '#475569', label: 'Paused' }
};

const triggerIcons = {
    WEBHOOK: '🔗',
    CRON: '⏰',
    MANUAL: '▶️'
};

const WorkflowCard = ({ workflow, onDelete, onPublish }) => {

    const navigate = useNavigate();
    const status = statusColors[workflow.status] || statusColors.DRAFT;
    const triggerIcon = triggerIcons[workflow.triggerType] || '▶️';

    return (
        <div style={styles.card}>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleRow}>
                    <span style={styles.triggerIcon}>{triggerIcon}</span>
                    <h3 style={styles.title}>{workflow.name}</h3>
                </div>
                <span style={{
                    ...styles.badge,
                    backgroundColor: status.bg,
                    color: status.text
                }}>
                    {status.label}
                </span>
            </div>

            {/* Description */}
            {workflow.description && (
                <p style={styles.description}>{workflow.description}</p>
            )}

            {/* Info row */}
            <div style={styles.infoRow}>
                <span style={styles.infoItem}>
                    🕐 {new Date(workflow.createdAt)
                        .toLocaleDateString('en-IN')}
                </span>
                {workflow.cronString && (
                    <span style={styles.infoItem}>
                        ⏰ {workflow.cronString}
                    </span>
                )}
            </div>

            {/* Webhook key — show only if published */}
            {workflow.status === 'PUBLISHED' && workflow.webhookKey && (
                <div style={styles.webhookBox}>
                    <span style={styles.webhookLabel}>Webhook Key:</span>
                    <code style={styles.webhookKey}>
                        {workflow.webhookKey.substring(0, 16)}...
                    </code>
                </div>
            )}

            {/* Actions */}
            <div style={styles.actions}>
                <button
                    style={styles.btnPrimary}
                    onClick={() => navigate(`/workflows/${workflow.id}`)}
                >
                    View Details
                </button>

                {workflow.status === 'DRAFT' && (
                    <button
                        style={styles.btnSuccess}
                        onClick={() => onPublish(workflow.id)}
                    >
                        Publish
                    </button>
                )}

                <button
                    style={styles.btnDanger}
                    onClick={() => onDelete(workflow.id)}
                >
                    Delete
                </button>
            </div>

        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        transition: 'box-shadow 0.2s',
        cursor: 'default'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    triggerIcon: {
        fontSize: '18px'
    },
    title: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        margin: 0
    },
    badge: {
        fontSize: '12px',
        fontWeight: '500',
        padding: '3px 10px',
        borderRadius: '20px',
        whiteSpace: 'nowrap'
    },
    description: {
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '12px',
        lineHeight: '1.5'
    },
    infoRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '12px'
    },
    infoItem: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    webhookBox: {
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        padding: '8px 12px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    webhookLabel: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '500'
    },
    webhookKey: {
        fontSize: '12px',
        color: '#3b82f6',
        fontFamily: 'monospace'
    },
    actions: {
        display: 'flex',
        gap: '8px',
        marginTop: '4px'
    },
    btnPrimary: {
        padding: '7px 14px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    btnSuccess: {
        padding: '7px 14px',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    btnDanger: {
        padding: '7px 14px',
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    }
};

export default WorkflowCard;