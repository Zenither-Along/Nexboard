"use client"

import { useTheme } from 'next-themes';
import { User, Clock } from 'lucide-react';
import { Task, useBoardStore } from '@/store/useBoardStore';

interface KanbanCardProps {
    task: Task;
    columnColor: string;
    columnId: string;
    boardId: string;
    index: number;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onClick: () => void;
}

export function KanbanCard({ task, columnColor, columnId, boardId, index, onDragStart, onDragEnd, onClick }: KanbanCardProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { moveItem } = useBoardStore();
    
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('application/json', JSON.stringify({ 
                    type: 'move-item', 
                    itemId: task.id, 
                    fromColumnId: columnId,
                    kind: 'task'
                }));
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(e);
            }}
            onDragEnd={onDragEnd}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.boxShadow = '0 -2px 0 0 #8b5cf6'; 
            }}
            onDragLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.boxShadow = 'none';
                
                try {
                    const rawData = e.dataTransfer.getData('application/json');
                    if (rawData) {
                        const data = JSON.parse(rawData);
                        if (data.type === 'move-item') {
                            moveItem(boardId, data.itemId, data.fromColumnId, columnId, index);
                        }
                    }
                } catch (err) {
                    // Ignore invalid data
                }
            }}
            onClick={onClick}
            style={{
                backgroundColor: cardBg,
                borderRadius: 10,
                padding: 14,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
            }}
        >
            {task.client && (
                <p style={{
                    fontSize: 11,
                    color: textMuted,
                    marginBottom: 6,
                }}>
                    Client: {task.client}
                </p>
            )}

            <p style={{
                fontSize: 14,
                fontWeight: 500,
                color: textPrimary,
                marginBottom: 10,
                lineHeight: 1.4,
            }}>
                {task.title}
            </p>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                flexWrap: 'wrap',
            }}>
                {task.assignee && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}>
                        <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <User size={12} color={textMuted} />
                        </div>
                        <span style={{ fontSize: 12, color: textSecondary }}>
                            {task.assignee}
                        </span>
                    </div>
                )}
                {task.tags.map(tag => (
                    <span
                        key={tag.label}
                        style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: tag.color,
                            backgroundColor: `${tag.color}15`,
                            padding: '2px 8px',
                            borderRadius: 4,
                        }}
                    >
                        {tag.label}
                    </span>
                ))}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
            }}>
                {task.dueDate && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginLeft: 'auto',
                    }}>
                        <Clock size={12} color={textMuted} />
                        <span style={{ fontSize: 11, color: textMuted }}>
                            {task.dueDate}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
