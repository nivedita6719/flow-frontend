import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../services/api';
import Navbar from '../components/Navbar';
import NodeBuilder from '../components/NodeBuilder';

const TRIGGER_TYPES = ['WEBHOOK', 'CRON', 'MANUAL'];

const WorkflowBuilderPage = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        triggerType: 'WEBHOOK',
        cronString: ''
    });

    const [nodes, setNodes] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSave = async () => {
        // Validate
        if (!formData.name.trim()) {
            setError('Workflow name is required');
            return;
        }
        if (nodes.length === 0) {
            setError('Add at least one node');
            return;
        }
        if (formData.triggerType === 'CRON'
            && !formData.cronString.trim()) {
            setError('Cron expression is required');
            return;
        }

        setSaving(true);
        try {
            await workflowAPI.create({
                ...formData,
                nodesConfig: JSON.stringify(nodes)
            });
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to save workflow'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>

                {/* Page header */}
                <div style={styles.pageHeader}>
                    <button
                        style={styles.backBtn}
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Back
                    </button>
                    <h1 style={styles.pageTitle}>Create Workflow</h1>
                </div>

                <div style={styles.layout}>

                    {/* Left — workflow settings */}
                    <div style={styles.leftPanel}>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>
                                Basic Information
                            </h3>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Workflow Name *
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. GitHub to Slack Alert"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="What does this workflow do?"
                                    style={styles.textarea}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>
                                Trigger Settings
                            </h3>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Trigger Type *
                                </label>
                                <div style={styles.triggerButtons}>
                                    {TRIGGER_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            style={{
                                                ...styles.triggerBtn,
                                                ...(formData.triggerType
                                                    === type
                                                    ? styles.triggerBtnActive
                                                    : {})
                                            }}
                                            onClick={() => setFormData({
                                                ...formData,
                                                triggerType: type
                                            })}
                                        >
                                            {type === 'WEBHOOK' && '🔗 '}
                                            {type === 'CRON' && '⏰ '}
                                            {type === 'MANUAL' && '▶️ '}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Show cron input only for CRON type */}
                            {formData.triggerType === 'CRON' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Cron Expression *
                                    </label>
                                    <input
                                        name="cronString"
                                        value={formData.cronString}
                                        onChange={handleChange}
                                        placeholder="0 0 9 * * * (every day at 9 AM)"
                                        style={styles.input}
                                    />
                                    <p style={styles.hint}>
                                        Format: second minute hour day month weekday
                                        <br />
                                        Examples:
                                        <br />
                                        • Every minute: 0 * * * * *
                                        <br />
                                        • Daily 9AM: 0 0 9 * * *
                                        <br />
                                        • Every Monday: 0 0 9 * * MON
                                    </p>
                                </div>
                            )}

                            {/* Show webhook info */}
                            {formData.triggerType === 'WEBHOOK' && (
                                <div style={styles.infoBox}>
                                    <p style={styles.infoText}>
                                        🔗 After publishing, you will get a
                                        unique webhook URL and secret key.
                                        Use it to trigger this workflow from
                                        GitHub, Stripe, or any service.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={styles.errorBox}>{error}</div>
                        )}

                        {/* Save button */}
                        <button
                            style={{
                                ...styles.saveBtn,
                                opacity: saving ? 0.7 : 1
                            }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : '💾 Save Workflow'}
                        </button>

                    </div>

                    {/* Right — node builder */}
                    <div style={styles.rightPanel}>
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>
                                Workflow Nodes
                            </h3>
                            <p style={styles.sectionSubtitle}>
                                Nodes execute in order.
                                Output of each node passes to the next.
                            </p>
                            <NodeBuilder
                                nodes={nodes}
                                setNodes={setNodes}
                            />
                        </div>
                    </div>

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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    pageHeader: {
        display: 'flex',
        alignItems: 'center',
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
        color: '#374151'
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        margin: 0
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '24px',
        alignItems: 'start'
    },
    leftPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    rightPanel: {},
    section: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 4px 0'
    },
    sectionSubtitle: {
        fontSize: '13px',
        color: '#64748b',
        margin: '0 0 20px 0'
    },
    formGroup: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px'
    },
    input: {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e293b',
        boxSizing: 'border-box',
        outline: 'none'
    },
    textarea: {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e293b',
        boxSizing: 'border-box',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    triggerButtons: {
        display: 'flex',
        gap: '8px'
    },
    triggerBtn: {
        flex: 1,
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        backgroundColor: 'white',
        color: '#374151'
    },
    triggerBtnActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        color: '#3b82f6'
    },
    hint: {
        fontSize: '12px',
        color: '#94a3b8',
        marginTop: '6px',
        lineHeight: '1.6'
    },
    infoBox: {
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '8px'
    },
    infoText: {
        fontSize: '13px',
        color: '#1d4ed8',
        margin: 0,
        lineHeight: '1.5'
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '13px'
    },
    saveBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default WorkflowBuilderPage;