"use client"

import { useCallback, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useBoardStore } from '@/store/useBoardStore';
import { useAppStore } from '@/store/useAppStore';

export function QuickActionsWidget() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { selectedBoardId, boards, selectBoard, addTask } = useBoardStore();
    const { setActiveView } = useAppStore();

    // Styles
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

    // Quick Actions handlers
    const handleNewTask = useCallback(() => {
        if (selectedBoardId) {
            const board = boards.find(b => b.id === selectedBoardId);
            if (board && board.columns.length > 0) {
                addTask(selectedBoardId, board.columns[0].id, {
                    title: 'New Task',
                    tags: [],
                    comments: 0,
                    attachments: 0,
                });
            }
        } else if (boards.length > 0) {
            selectBoard(boards[0].id);
        }
    }, [selectedBoardId, boards, addTask, selectBoard]);

    const handleGoToCanvas = useCallback(() => {
        setActiveView('canvas');
    }, [setActiveView]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    handleNewTask();
                    break;
                case 'c':
                    e.preventDefault();
                    handleGoToCanvas();
                    break;
                case '/':
                    e.preventDefault();
                    // Search functionality - could be added later
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNewTask, handleGoToCanvas]);

    const actions = [
        { label: 'New Task', keys: 'N', action: handleNewTask },
        { label: 'Search', keys: '/', action: () => {} },
        { label: 'Canvas', keys: 'C', action: handleGoToCanvas },
    ];

    return (
        <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 16,
            marginBottom: 80,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
            }}>
                <Zap size={16} color={textSecondary} strokeWidth={1.5} />
                <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
                    Quick Actions
                </span>
            </div>
            
            {actions.map(({ label, keys, action }) => (
                <button
                    key={label}
                    onClick={action}
                    style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        marginBottom: 4,
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: 12, color: textSecondary }}>{label}</span>
                    <span style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: textMuted,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                    }}>
                        {keys}
                    </span>
                </button>
            ))}
        </div>
    );
}
