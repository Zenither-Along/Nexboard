"use client"

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, Tag, Building2, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Task } from '@/store/useBoardStore';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    columnId: string;
    onSave: (task: Omit<Task, 'id'>, columnId: string) => void;
    onUpdate: (taskId: string, updates: Partial<Task>, columnId: string) => void;
    onDelete?: (taskId: string, columnId: string) => void;
    columns: { id: string; title: string; color: string }[];
}

const TAG_PRESETS = [
    { label: 'Web', color: '#3b82f6' },
    { label: 'Mobile', color: '#8b5cf6' },
    { label: 'Saas', color: '#ef4444' },
    { label: 'Design', color: '#f59e0b' },
    { label: 'Backend', color: '#10b981' },
    { label: 'Frontend', color: '#06b6d4' },
];

const CUSTOM_TAG_COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

export function TaskModal({ isOpen, onClose, task, columnId, onSave, onUpdate, onDelete, columns }: TaskModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [title, setTitle] = useState('');
    const [client, setClient] = useState('');
    const [assignee, setAssignee] = useState('');
    const [tags, setTags] = useState<{ label: string; color: string }[]>([]);
    const [dueDate, setDueDate] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState(columnId);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCustomTagInput, setShowCustomTagInput] = useState(false);
    const [customTagLabel, setCustomTagLabel] = useState('');
    const [customTagColor, setCustomTagColor] = useState(CUSTOM_TAG_COLORS[4]);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setClient(task.client || '');
            setAssignee(task.assignee || '');
            setTags(task.tags || []);
            // Try to make the existing date string compatible with datetime-local if possible
            // In a real app we'd parse this robustly. For now, if it's not a valid ISO-like string, we might just show it or empty.
            // But datetime-local requires YYYY-MM-DDTHH:mm. 
            // Existing "4d" won't work. We'll leave it simple for now, assuming user will pick a new date.
            setDueDate(task.dueDate || '');
        } else {
            setTitle('');
            setClient('');
            setAssignee('');
            setTags([]);
            setDueDate('');
        }
        setSelectedColumnId(columnId);
        setShowCustomTagInput(false);
        setCustomTagLabel('');
    }, [task, columnId, isOpen]);

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
    const bgModal = isDark ? '#1a1a1a' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
    const dropdownBg = isDark ? '#242424' : '#ffffff';

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;

        const taskData = {
            title: title.trim(),
            client: client.trim() || undefined,
            assignee: assignee.trim() || undefined,
            tags,
            dueDate: dueDate || undefined,
            comments: task?.comments || 0,
            attachments: task?.attachments || 0,
            progress: task?.progress,
        };

        if (task) {
            onUpdate(task.id, taskData, selectedColumnId);
        } else {
            onSave(taskData, selectedColumnId);
        }
        onClose();
    };

    const toggleTag = (tag: { label: string; color: string }) => {
        const exists = tags.find(t => t.label === tag.label);
        if (exists) {
            setTags(tags.filter(t => t.label !== tag.label));
        } else {
            setTags([...tags, tag]);
        }
    };

    const addCustomTag = () => {
        if (customTagLabel.trim()) {
            const newTag = { label: customTagLabel.trim(), color: customTagColor };
            setTags([...tags, newTag]);
            setCustomTagLabel('');
            setShowCustomTagInput(false);
        }
    };

    const removeTag = (label: string) => {
        setTags(tags.filter(t => t.label !== label));
    };

    const handleDelete = () => {
        if (task && onDelete) {
            onDelete(task.id, columnId);
            onClose();
        }
    };

    const selectedColumn = columns.find(c => c.id === selectedColumnId);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    backgroundColor: bgModal,
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 480,
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: `1px solid ${borderColor}`,
                }}>
                    <h2 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: textPrimary,
                    }}>
                        {task ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: textSecondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Title */}
                    <div>
                        <label style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: textSecondary,
                            display: 'block',
                            marginBottom: 8,
                        }}>
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter task title..."
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: 14,
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textPrimary,
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Status - Custom Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <label style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: textSecondary,
                            display: 'block',
                            marginBottom: 8,
                        }}>
                            Status
                        </label>
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: 14,
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textPrimary,
                                outline: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textAlign: 'left',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: selectedColumn?.color || '#6b7280',
                                }} />
                                {selectedColumn?.title || 'Select status'}
                            </div>
                            <ChevronDown size={16} color={textSecondary} />
                        </button>
                        
                        {showStatusDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: 4,
                                backgroundColor: dropdownBg,
                                border: `1px solid ${borderColor}`,
                                borderRadius: 10,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                zIndex: 10,
                                overflow: 'hidden',
                            }}>
                                {columns.map(col => (
                                    <button
                                        key={col.id}
                                        onClick={() => {
                                            setSelectedColumnId(col.id);
                                            setShowStatusDropdown(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            fontSize: 14,
                                            border: 'none',
                                            backgroundColor: selectedColumnId === col.id 
                                                ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                                                : 'transparent',
                                            color: textPrimary,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: col.color,
                                        }} />
                                        {col.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Client */}
                    <div>
                        <label style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: textSecondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 8,
                        }}>
                            <Building2 size={14} />
                            Client
                        </label>
                        <input
                            type="text"
                            value={client}
                            onChange={e => setClient(e.target.value)}
                            placeholder="Client name..."
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: 14,
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textPrimary,
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Assignee */}
                    <div>
                        <label style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: textSecondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 8,
                        }}>
                            <User size={14} />
                            Assignee
                        </label>
                        <input
                            type="text"
                            value={assignee}
                            onChange={e => setAssignee(e.target.value)}
                            placeholder="Assignee name..."
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: 14,
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textPrimary,
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: textSecondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 8,
                        }}>
                            <Calendar size={14} />
                            Due Date
                        </label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: 13,
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textPrimary,
                                outline: 'none',
                                fontFamily: 'inherit',
                                colorScheme: isDark ? 'dark' : 'light',
                            }}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: textSecondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 8,
                        }}>
                            <Tag size={14} />
                            Tags
                        </label>

                        {/* Selected Tags */}
                        {tags.length > 0 && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginBottom: 12,
                            }}>
                                {tags.map(tag => (
                                    <span
                                        key={tag.label}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            backgroundColor: tag.color,
                                            color: 'white',
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {tag.label}
                                        <button
                                            onClick={() => removeTag(tag.label)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                opacity: 0.7,
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Preset Tags */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginBottom: 12,
                        }}>
                            {TAG_PRESETS.filter(t => !tags.find(tag => tag.label === t.label)).map(tag => (
                                <button
                                    key={tag.label}
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 6,
                                        border: `1px solid ${borderColor}`,
                                        backgroundColor: 'transparent',
                                        color: textSecondary,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Tag Input */}
                        {showCustomTagInput ? (
                            <div style={{
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center',
                            }}>
                                <input
                                    type="text"
                                    value={customTagLabel}
                                    onChange={e => setCustomTagLabel(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                                    placeholder="Tag name..."
                                    autoFocus
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        fontSize: 13,
                                        borderRadius: 8,
                                        border: `1px solid ${borderColor}`,
                                        backgroundColor: inputBg,
                                        color: textPrimary,
                                        outline: 'none',
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {CUSTOM_TAG_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setCustomTagColor(color)}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 4,
                                                backgroundColor: color,
                                                border: customTagColor === color ? '2px solid white' : 'none',
                                                cursor: 'pointer',
                                                boxShadow: customTagColor === color ? '0 0 0 1px rgba(0,0,0,0.3)' : 'none',
                                            }}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={addCustomTag}
                                    disabled={!customTagLabel.trim()}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        backgroundColor: customTagLabel.trim() ? customTagColor : textMuted,
                                        color: 'white',
                                        cursor: customTagLabel.trim() ? 'pointer' : 'not-allowed',
                                        fontSize: 12,
                                        fontWeight: 500,
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCustomTagInput(false);
                                        setCustomTagLabel('');
                                    }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: 8,
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: textSecondary,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCustomTagInput(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: `1px dashed ${borderColor}`,
                                    backgroundColor: 'transparent',
                                    color: textMuted,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                }}
                            >
                                <Plus size={14} />
                                Custom tag
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderTop: `1px solid ${borderColor}`,
                }}>
                    {task && onDelete ? (
                        <button
                            onClick={handleDelete}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 16px',
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    ) : (
                        <div />
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: 'transparent',
                                color: textSecondary,
                                cursor: 'pointer',
                                fontSize: 13,
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: title.trim() ? (isDark ? '#ffffff' : '#0a0a0a') : textMuted,
                                color: title.trim() ? (isDark ? '#0a0a0a' : '#ffffff') : textSecondary,
                                cursor: title.trim() ? 'pointer' : 'not-allowed',
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
