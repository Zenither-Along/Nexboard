"use client"

import { useState } from 'react';
import { Type, AlignLeft, CheckSquare, Minus, Quote, Layout, Wrench } from 'lucide-react';
import { useTheme } from 'next-themes';
import { BlockType } from '@/store/useBoardStore';
import { TimerWidget } from './TimerWidget';
import { StatsWidget } from './StatsWidget';
import { QuickNotesWidget } from './QuickNotesWidget';
import { AmbienceWidget } from './AmbienceWidget';
import { QuickActionsWidget } from './QuickActionsWidget';

interface WidgetBlock {
    type: BlockType;
    icon: React.ComponentType<any>;
    label: string;
    color: string;
}

const WIDGET_BLOCKS: WidgetBlock[] = [
    { type: 'heading', icon: Type, label: 'Heading', color: '#8b5cf6' },
    { type: 'text', icon: AlignLeft, label: 'Text', color: '#06b6d4' },
    { type: 'checklist', icon: CheckSquare, label: 'Checklist', color: '#22c55e' },
    { type: 'divider', icon: Minus, label: 'Divider', color: '#6b7280' },
    { type: 'quote', icon: Quote, label: 'Quote', color: '#f59e0b' },
];

type TabType = 'insert' | 'tools';

export function WidgetPalette() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [activeTab, setActiveTab] = useState<TabType>('tools');

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
    const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

    const handleDragStart = (e: React.DragEvent, blockType: BlockType) => {
        e.dataTransfer.setData('text/plain', blockType);
        e.dataTransfer.setData('application/block-type', blockType);
        e.dataTransfer.effectAllowed = 'copy';
        // Set drag image opacity
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.6';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                padding: 4,
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                borderRadius: 10,
                marginBottom: 24,
            }}>
                <button
                    onClick={() => setActiveTab('tools')}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: activeTab === 'tools' ? (isDark ? 'rgba(255,255,255,0.08)' : '#ffffff') : 'transparent',
                        color: activeTab === 'tools' ? textPrimary : textSecondary,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: activeTab === 'tools' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <Wrench size={14} />
                    Tools
                </button>
                <button
                    onClick={() => setActiveTab('insert')}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: activeTab === 'insert' ? (isDark ? 'rgba(255,255,255,0.08)' : '#ffffff') : 'transparent',
                        color: activeTab === 'insert' ? textPrimary : textSecondary,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: activeTab === 'insert' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <Layout size={14} />
                    Insert
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {activeTab === 'insert' && (
                    <>
                        {/* Header */}
                        <div>
                            <h3 style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: textPrimary,
                                marginBottom: 4,
                            }}>
                                Content Blocks
                            </h3>
                            <p style={{
                                fontSize: 12,
                                color: textSecondary,
                                margin: 0,
                            }}>
                                Drag onto task cards
                            </p>
                        </div>

                        {/* Block Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 12,
                        }}>
                            {WIDGET_BLOCKS.map(({ type, icon: Icon, label, color }) => (
                                <div
                                    key={type}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, type)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        backgroundColor: cardBg,
                                        borderRadius: 12,
                                        padding: 16,
                                        cursor: 'grab',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 10,
                                        transition: 'all 0.15s ease',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = hoverBg;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = cardBg;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.cursor = 'grabbing';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.cursor = 'grab';
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: `${color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Icon size={20} color={color} strokeWidth={2} />
                                    </div>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: textSecondary,
                                    }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'tools' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <StatsWidget />
                        <TimerWidget />
                        <AmbienceWidget />
                        <QuickNotesWidget />
                        <QuickActionsWidget />
                    </div>
                )}
            </div>
        </div>
    );
}
