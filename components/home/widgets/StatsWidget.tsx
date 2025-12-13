"use client"

import { BarChart3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useBoardStore } from '@/store/useBoardStore';

export function StatsWidget() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { selectedBoardId, boards } = useBoardStore();

    // Calculate stats
    const selectedBoard = boards.find(b => b.id === selectedBoardId);
    const totalTasks = selectedBoard 
        ? selectedBoard.columns.reduce((sum, col) => sum + col.items.filter(i => i.kind === 'task').length, 0)
        : boards.reduce((sum, board) => sum + board.columns.reduce((s, c) => s + c.items.filter(i => i.kind === 'task').length, 0), 0);
    const completedTasks = selectedBoard
        ? selectedBoard.columns.find(c => c.id === 'completed')?.items.filter(i => i.kind === 'task').length || 0
        : boards.reduce((sum, board) => sum + (board.columns.find(c => c.id === 'completed')?.items.filter(i => i.kind === 'task').length || 0), 0);
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Styles
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

    return (
        <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 16,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
            }}>
                <BarChart3 size={16} color={textSecondary} strokeWidth={1.5} />
                <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
                    Progress
                </span>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 10,
                    padding: 12,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: textPrimary }}>{totalTasks}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>Total</div>
                </div>
                <div style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 10,
                    padding: 12,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#10b981' }}>{completedTasks}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>Done</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                }}>
                    <span style={{ fontSize: 11, color: textMuted }}>Completion</span>
                    <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>{progressPercent}%</span>
                </div>
                <div style={{
                    height: 6,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        backgroundColor: '#10b981',
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>
        </div>
    );
}
