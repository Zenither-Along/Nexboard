"use client"

import { useTheme } from 'next-themes';
import { Calendar, User } from 'lucide-react';
import { Board, Task } from '@/store/useBoardStore';

interface KanbanListProps {
    board: Board;
    onEditTask: (task: Task, columnId: string) => void;
}

export function KanbanList({ board, onEditTask }: KanbanListProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
    const rowHoverBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            paddingBottom: 40,
        }}>
            {/* Header Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 2fr) 150px 150px 150px',
                padding: '12px 16px',
                borderBottom: `1px solid ${borderColor}`,
                color: textSecondary,
                fontSize: 13,
                fontWeight: 500,
            }}>
                <div>Title</div>
                <div>Status</div>
                <div>Assignee</div>
                <div>Due Date</div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {board.columns.map(column => (
                    column.items.map(item => {
                        if (item.kind === 'task') {
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onEditTask(item, column.id)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'minmax(300px, 2fr) 150px 150px 150px',
                                        padding: '12px 16px',
                                        borderBottom: `1px solid ${borderColor}`,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        color: textPrimary,
                                        alignItems: 'center',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = rowHoverBg}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ 
                                            width: 8, 
                                            height: 8, 
                                            borderRadius: 2, 
                                            backgroundColor: column.color 
                                        }} />
                                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ 
                                            fontSize: 12, 
                                            padding: '2px 8px', 
                                            borderRadius: 12, 
                                            backgroundColor: `${column.color}15`,
                                            color: column.color
                                        }}>
                                            {column.title}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {item.assignee ? (
                                            <>
                                                <div style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                     <User size={12} color={textSecondary} />
                                                </div>
                                                <span style={{ fontSize: 13, color: textPrimary }}>
                                                    {item.assignee}
                                                </span>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: 13, color: textSecondary }}>-</span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: textSecondary }}>
                                        {item.dueDate && <Calendar size={14} />}
                                        <span style={{ fontSize: 13 }}>
                                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        // We could handle 'block' types here if desired, basically just showing their type
                        return null;
                    })
                ))}
            </div>
            
            {board.columns.every(c => c.items.filter(i => i.kind === 'task').length === 0) && (
                <div style={{
                    padding: 40,
                    textAlign: 'center',
                    color: textSecondary,
                    fontSize: 14,
                }}>
                    No tasks found in this board.
                </div>
            )}
        </div>
    );
}
