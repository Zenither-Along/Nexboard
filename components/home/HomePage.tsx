"use client"

import { useTheme } from 'next-themes';
import { useBoardStore } from '@/store/useBoardStore';
import { BoardsList } from './BoardsList';
import { KanbanBoard } from './KanbanBoard';
import { WidgetPalette } from './widgets';

export function HomePage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { selectedBoardId } = useBoardStore();

    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            display: 'flex',
        }}>
            {/* Main Content */}
            <div style={{
                flex: 1,
                height: '100vh',
                paddingLeft: 100,
                paddingTop: 32,
                paddingRight: 24,
                paddingBottom: 50,
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}>
                {selectedBoardId ? <KanbanBoard /> : <BoardsList />}
            </div>

            {/* Right Sidebar - Widget Palette */}
            <div 
                style={{
                    width: 280,
                    height: '100vh',
                    borderLeft: `1px solid ${borderColor}`,
                    padding: 20,
                    paddingTop: 32,
                    paddingBottom: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                <WidgetPalette />
            </div>
        </div>
    );
}
