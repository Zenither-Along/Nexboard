"use client"

import * as React from 'react';
import { Timer, Music, FileText, Moon, Sun, Home, Settings, Grid3X3, X, Layout } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function Toolbar() {
    const { setTheme, resolvedTheme } = useTheme();
    const [showWidgets, setShowWidgets] = useState(false);
    const { activeView, setActiveView } = useAppStore();
    
    const isDark = resolvedTheme === 'dark';

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setShowWidgets(false);
    };

    const widgets = [
        { type: 'pomodoro', icon: Timer, label: 'Timer', color: '#a855f7' },
        { type: 'ambience', icon: Music, label: 'Sounds', color: '#06b6d4' },
        { type: 'stickyNote', icon: FileText, label: 'Note', color: '#eab308' },
    ];

    return (
        <>
            {/* Sidebar */}
            <div 
                style={{
                    position: 'fixed',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: isDark ? 'rgba(23, 23, 23, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: isDark 
                        ? '0 8px 32px rgba(0,0,0,0.4)' 
                        : '0 8px 32px rgba(0,0,0,0.08)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Home */}
                <button
                    onClick={() => setActiveView('home')}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: activeView === 'home' 
                            ? '#3b82f6' 
                            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    title="Home"
                >
                    <Home 
                        size={18} 
                        strokeWidth={1.5}
                        color={activeView === 'home' ? 'white' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)')} 
                    />
                </button>

                {/* Canvas */}
                <button
                    onClick={() => setActiveView('canvas')}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: activeView === 'canvas' 
                            ? '#3b82f6' 
                            : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    title="Canvas"
                >
                    <Layout 
                        size={18} 
                        strokeWidth={1.5}
                        color={activeView === 'canvas' ? 'white' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')} 
                    />
                </button>

                {/* Widgets */}
                <button
                    onClick={() => setShowWidgets(!showWidgets)}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: showWidgets 
                            ? '#3b82f6' 
                            : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    title="Widgets"
                >
                    <Grid3X3 
                        size={18} 
                        strokeWidth={1.5}
                        color={showWidgets ? 'white' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')} 
                    />
                </button>

                {/* Settings */}
                <button
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    title="Settings"
                >
                    <Settings 
                        size={18} 
                        strokeWidth={1.5}
                        color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} 
                    />
                </button>

                {/* Divider */}
                <div style={{ 
                    width: 24, 
                    height: 1, 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    margin: '4px 0'
                }} />

                {/* Theme */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    title="Toggle theme"
                >
                    {isDark ? (
                        <Moon size={18} strokeWidth={1.5} color="rgba(255,255,255,0.5)" />
                    ) : (
                        <Sun size={18} strokeWidth={1.5} color="rgba(0,0,0,0.4)" />
                    )}
                </button>
            </div>

            {/* Widget Panel */}
            {showWidgets && (
                <>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setShowWidgets(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999,
                        }}
                    />
                    
                    {/* Panel */}
                    <div
                        style={{
                            position: 'fixed',
                            left: 80,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1001,
                            padding: 16,
                            borderRadius: 16,
                            backgroundColor: isDark ? 'rgba(23, 23, 23, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                            boxShadow: isDark 
                                ? '0 16px 48px rgba(0,0,0,0.5)' 
                                : '0 16px 48px rgba(0,0,0,0.12)',
                            backdropFilter: 'blur(20px)',
                            minWidth: 180,
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: 16 
                        }}>
                            <span style={{ 
                                fontSize: 13, 
                                fontWeight: 500,
                                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                                letterSpacing: '0.02em'
                            }}>
                                Widgets
                            </span>
                            <button
                                onClick={() => setShowWidgets(false)}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={14} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} />
                            </button>
                        </div>

                        {/* Widgets */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {widgets.map((widget) => (
                                <div
                                    key={widget.type}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, widget.type)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 12,
                                        borderRadius: 12,
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                        cursor: 'grab',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
                                    }}
                                >
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: `${widget.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <widget.icon size={16} strokeWidth={1.5} color={widget.color} />
                                    </div>
                                    <span style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
                                    }}>
                                        {widget.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Footer hint */}
                        <p style={{
                            fontSize: 11,
                            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                            marginTop: 12,
                            textAlign: 'center',
                        }}>
                            Drag to add
                        </p>
                    </div>
                </>
            )}
        </>
    );
}
