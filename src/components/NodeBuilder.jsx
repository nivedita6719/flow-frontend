import React, { useState } from 'react';
import NodeForm from './NodeForm';

const NODE_TYPES = [
    {
        type: 'HTTP',
        icon: '🌐',
        label: 'HTTP Request',
        desc: 'Call any external API'
    },
    {
        type: 'CONDITION',
        icon: '🔀',
        label: 'Condition',
        desc: 'If/else branching logic'
    },
    {
        type: 'AI',
        icon: '✨',
        label: 'AI Node',
        desc: 'Gemini AI processing'
    },
    {
        type: 'NOTIFY',
        icon: '🔔',
        label: 'Notify',
        desc: 'Slack or Email alert'
    },
    {
        type: 'DELAY',
        icon: '⏱',
        label: 'Delay',
        desc: 'Wait N seconds'
    }
];

const NodeBuilder = ({ nodes, setNodes }) => {

    const [editingIndex, setEditingIndex] = useState(null);

    const addNode = (type) => {
        const newNode = {
            id: `node_${Date.now()}`,
            type: type,
            config: getDefaultConfig(type),
            next: null
        };

        const updatedNodes = [...nodes, newNode];

        // Auto-wire next — each node points to next
        for (let i = 0; i < updatedNodes.length - 1; i++) {
            updatedNodes[i].next = updatedNodes[i + 1].id;
        }

        setNodes(updatedNodes);
        setEditingIndex(updatedNodes.length - 1);
    };

    const updateNode = (index, updatedConfig) => {
        const updated = [...nodes];
        updated[index] = {
            ...updated[index],
            config: updatedConfig
        };
        setNodes(updated);
    };

    const removeNode = (index) => {
        const updated = nodes.filter((_, i) => i !== index);

        // Re-wire next pointers
        for (let i = 0; i < updated.length - 1; i++) {
            updated[i].next = updated[i + 1].id;
        }
        if (updated.length > 0) {
            updated[updated.length - 1].next = null;
        }

        setNodes(updated);
        setEditingIndex(null);
    };

    const getDefaultConfig = (type) => {
        switch (type) {
            case 'HTTP':
                return { method: 'GET', url: '', body: '' };
            case 'CONDITION':
                return {
                    field: '',
                    operator: 'EQ',
                    value: '',
                    trueNext: '',
                    falseNext: ''
                };
            case 'AI':
                return { prompt: '' };
            case 'NOTIFY':
                return {
                    type: 'SLACK',
                    webhookUrl: '',
                    message: ''
                };
            case 'DELAY':
                return { seconds: 5 };
            default:
                return {};
        }
    };

    return (
        <div>

            {/* Existing nodes */}
            {nodes.length === 0 ? (
                <div style={styles.emptyNodes}>
                    <p style={styles.emptyText}>
                        No nodes yet. Add your first node below.
                    </p>
                </div>
            ) : (
                <div style={styles.nodeList}>
                    {nodes.map((node, index) => {
                        const nodeType = NODE_TYPES.find(
                            n => n.type === node.type
                        );
                        return (
                            <div key={node.id}>
                                {/* Node item */}
                                <div style={styles.nodeItem}>
                                    <div style={styles.nodeLeft}>
                                        <span style={styles.nodeNumber}>
                                            {index + 1}
                                        </span>
                                        <span style={styles.nodeIcon}>
                                            {nodeType?.icon}
                                        </span>
                                        <div>
                                            <div style={styles.nodeLabel}>
                                                {nodeType?.label}
                                            </div>
                                            <div style={styles.nodeId}>
                                                ID: {node.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.nodeActions}>
                                        <button
                                            style={styles.editBtn}
                                            onClick={() => setEditingIndex(
                                                editingIndex === index
                                                    ? null
                                                    : index
                                            )}
                                        >
                                            {editingIndex === index
                                                ? 'Close'
                                                : 'Configure'}
                                        </button>
                                        <button
                                            style={styles.removeBtn}
                                            onClick={() => removeNode(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Node config form */}
                                {editingIndex === index && (
                                    <NodeForm
                                        node={node}
                                        onUpdate={(config) =>
                                            updateNode(index, config)
                                        }
                                    />
                                )}

                                {/* Arrow between nodes */}
                                {index < nodes.length - 1 && (
                                    <div style={styles.arrow}>↓</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add node buttons */}
            <div style={styles.addSection}>
                <p style={styles.addLabel}>Add Node:</p>
                <div style={styles.addButtons}>
                    {NODE_TYPES.map(nodeType => (
                        <button
                            key={nodeType.type}
                            style={styles.addBtn}
                            onClick={() => addNode(nodeType.type)}
                        >
                            {nodeType.icon} {nodeType.label}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

const styles = {
    emptyNodes: {
        textAlign: 'center',
        padding: '32px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '2px dashed #e2e8f0',
        marginBottom: '16px'
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: '14px',
        margin: 0
    },
    nodeList: {
        marginBottom: '16px'
    },
    nodeItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 16px'
    },
    nodeLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    nodeNumber: {
        width: '24px',
        height: '24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600',
        flexShrink: 0
    },
    nodeIcon: {
        fontSize: '18px'
    },
    nodeLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1e293b'
    },
    nodeId: {
        fontSize: '11px',
        color: '#94a3b8',
        fontFamily: 'monospace'
    },
    nodeActions: {
        display: 'flex',
        gap: '8px'
    },
    editBtn: {
        padding: '5px 12px',
        backgroundColor: '#eff6ff',
        color: '#3b82f6',
        border: '1px solid #bfdbfe',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    removeBtn: {
        padding: '5px 10px',
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    arrow: {
        textAlign: 'center',
        fontSize: '20px',
        color: '#94a3b8',
        padding: '4px 0'
    },
    addSection: {
        borderTop: '1px solid #e2e8f0',
        paddingTop: '16px',
        marginTop: '8px'
    },
    addLabel: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '10px'
    },
    addButtons: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
    },
    addBtn: {
        padding: '7px 14px',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '13px',
        cursor: 'pointer',
        color: '#374151',
        fontWeight: '500'
    }
};

export default NodeBuilder;