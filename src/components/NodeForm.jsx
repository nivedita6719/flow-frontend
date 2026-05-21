import React, { useState } from 'react';

const NodeForm = ({ node, onUpdate }) => {

    const [config, setConfig] = useState({ ...node.config });

    const handleChange = (field, value) => {
        const updated = { ...config, [field]: value };
        setConfig(updated);
        onUpdate(updated);
    };

    const renderForm = () => {
        switch (node.type) {

            case 'HTTP':
                return (
                    <div>
                        <FormField label="HTTP Method">
                            <select
                                value={config.method || 'GET'}
                                onChange={e =>
                                    handleChange('method', e.target.value)
                                }
                                style={styles.select}
                            >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                        </FormField>
                        <FormField label="URL *">
                            <input
                                value={config.url || ''}
                                onChange={e =>
                                    handleChange('url', e.target.value)
                                }
                                placeholder="https://api.example.com/data"
                                style={styles.input}
                            />
                        </FormField>
                        <FormField label="Request Body (JSON)">
                            <textarea
                                value={config.body || ''}
                                onChange={e =>
                                    handleChange('body', e.target.value)
                                }
                                placeholder='{"key": "value"}'
                                style={styles.textarea}
                                rows={3}
                            />
                        </FormField>
                    </div>
                );

            case 'CONDITION':
                return (
                    <div>
                        <FormField
                            label="Field (dot notation)"
                            hint="e.g. node_1.data.status">
                            <input
                                value={config.field || ''}
                                onChange={e =>
                                    handleChange('field', e.target.value)
                                }
                                placeholder="node_1.data.stargazers_count"
                                style={styles.input}
                            />
                        </FormField>
                        <FormField label="Operator">
                            <select
                                value={config.operator || 'EQ'}
                                onChange={e =>
                                    handleChange('operator', e.target.value)
                                }
                                style={styles.select}
                            >
                                <option value="EQ">Equals (EQ)</option>
                                <option value="NEQ">
                                    Not Equals (NEQ)
                                </option>
                                <option value="GT">
                                    Greater Than (GT)
                                </option>
                                <option value="LT">Less Than (LT)</option>
                                <option value="CONTAINS">
                                    Contains (CONTAINS)
                                </option>
                            </select>
                        </FormField>
                        <FormField label="Value">
                            <input
                                value={config.value || ''}
                                onChange={e =>
                                    handleChange('value', e.target.value)
                                }
                                placeholder="1000"
                                style={styles.input}
                            />
                        </FormField>
                    </div>
                );

            case 'AI':
                return (
                    <div>
                        <FormField
                            label="AI Prompt *"
                            hint="Use {{context}} for previous node output">
                            <textarea
                                value={config.prompt || ''}
                                onChange={e =>
                                    handleChange('prompt', e.target.value)
                                }
                                placeholder={
                                    "Summarize this data in 3 bullet points: {{context}}"
                                }
                                style={styles.textarea}
                                rows={5}
                            />
                        </FormField>
                        <div style={styles.tipBox}>
                            <p style={styles.tipText}>
                                💡 <strong>Tips:</strong><br />
                                • Use <code>{'{{context}}'}</code> to
                                include all previous node outputs<br />
                                • Use <code>{'{{node_1}}'}</code> for
                                specific node output<br />
                                • Be specific in your prompt for
                                better AI responses
                            </p>
                        </div>
                    </div>
                );

            case 'NOTIFY':
                return (
                    <div>
                        <FormField label="Notification Type">
                            <select
                                value={config.type || 'SLACK'}
                                onChange={e =>
                                    handleChange('type', e.target.value)
                                }
                                style={styles.select}
                            >
                                <option value="SLACK">Slack</option>
                            </select>
                        </FormField>
                        <FormField
                            label="Slack Webhook URL *"
                            hint="From Slack App settings">
                            <input
                                value={config.webhookUrl || ''}
                                onChange={e =>
                                    handleChange(
                                        'webhookUrl', e.target.value
                                    )
                                }
                                placeholder="https://hooks.slack.com/..."
                                style={styles.input}
                            />
                        </FormField>
                        <FormField
                            label="Message *"
                            hint="Use {{node_2.aiResponse}} for AI output">
                            <textarea
                                value={config.message || ''}
                                onChange={e =>
                                    handleChange('message', e.target.value)
                                }
                                placeholder={
                                    "Deployment alert: {{node_2.aiResponse}}"
                                }
                                style={styles.textarea}
                                rows={3}
                            />
                        </FormField>
                    </div>
                );

            case 'DELAY':
                return (
                    <FormField
                        label="Delay (seconds)"
                        hint="Workflow pauses for this many seconds">
                        <input
                            type="number"
                            value={config.seconds || 5}
                            onChange={e =>
                                handleChange(
                                    'seconds',
                                    parseInt(e.target.value)
                                )
                            }
                            min={1}
                            max={3600}
                            style={styles.input}
                        />
                    </FormField>
                );

            default:
                return (
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                        No configuration needed
                    </p>
                );
        }
    };

    return (
        <div style={styles.form}>
            {renderForm()}
        </div>
    );
};

// Helper component
const FormField = ({ label, hint, children }) => (
    <div style={styles.formGroup}>
        <label style={styles.label}>{label}</label>
        {children}
        {hint && <p style={styles.hint}>{hint}</p>}
    </div>
);

const styles = {
    form: {
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '4px',
        marginBottom: '4px'
    },
    formGroup: {
        marginBottom: '14px'
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '5px'
    },
    input: {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        outline: 'none'
    },
    select: {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        outline: 'none'
    },
    textarea: {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    hint: {
        fontSize: '11px',
        color: '#64748b',
        marginTop: '4px',
        marginBottom: 0
    },
    tipBox: {
        backgroundColor: '#fefce8',
        border: '1px solid #fef08a',
        borderRadius: '6px',
        padding: '10px 12px'
    },
    tipText: {
        fontSize: '12px',
        color: '#713f12',
        margin: 0,
        lineHeight: '1.6'
    }
};

export default NodeForm;