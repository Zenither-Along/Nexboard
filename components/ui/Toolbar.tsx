"use client"

import * as React from 'react';
import { 
  Image as ImageIcon, 
  StickyNote, 
  Home, 
  Settings, 
  X, 
  Layout, 
  Moon, 
  Sun,
  MousePointer2,
  Square,
  Type,
  Frame,
  Hand,
  MessageSquare,
  Pencil,
  PenTool
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import useStore, { Tool } from '@/store/useStore';

export function Toolbar() {
    const { setTheme, resolvedTheme } = useTheme();
    const { activeView, setActiveView } = useAppStore();
    const { activeTool, setActiveTool } = useStore();
    const isDark = resolvedTheme === 'dark';

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;
            
            switch (e.key.toLowerCase()) {
                case 'v': setActiveTool('select'); break;
                case 'h': setActiveTool('hand'); break;
                case 'p': 
                    if (e.shiftKey) {
                        setActiveTool('pen');
                    } else {
                        setActiveTool('pencil');
                    }
                    break;
                case 'f': setActiveTool('frame'); break;
                case 'r': setActiveTool('rectangle'); break;
                case 't': setActiveTool('text'); break;
                case 'c': setActiveTool('comment'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Bottom toolbar tools (Figma-style)
    const tools: { id: Tool; icon: React.ElementType; label: string; shortcut: string; nodeType?: string }[] = [
        { id: 'select', icon: MousePointer2, label: 'Move', shortcut: 'V' },
        { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
        { id: 'pencil', icon: Pencil, label: 'Pencil', shortcut: 'P' },
        { id: 'pen', icon: PenTool, label: 'Pen', shortcut: '⇧P' },
        { id: 'frame', icon: Frame, label: 'Frame', shortcut: 'F', nodeType: 'frameNode' },
        { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R', nodeType: 'rectangleNode' },
        { id: 'text', icon: Type, label: 'Text', shortcut: 'T', nodeType: 'textNode' },
        { id: 'polaroid', icon: ImageIcon, label: 'Polaroid', shortcut: '', nodeType: 'polaroidNode' },
        { id: 'sticky', icon: StickyNote, label: 'Sticky', shortcut: '', nodeType: 'stickyNote' },
        { id: 'comment', icon: MessageSquare, label: 'Comment', shortcut: 'C' },
    ];

    return (
        <>
            {/* Left Sidebar - Navigation */}
            <div 
                style={{
                    position: 'fixed',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: 6,
                    borderRadius: 16,
                    backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                }}
            >
                <SidebarButton 
                    icon={Home} 
                    active={activeView === 'home'}
                    onClick={() => setActiveView('home')}
                    isDark={isDark}
                    title="Home"
                />
                <SidebarButton 
                    icon={Layout} 
                    active={activeView === 'canvas'}
                    onClick={() => setActiveView('canvas')}
                    isDark={isDark}
                    title="Canvas"
                />
                
                <div style={{ 
                    width: 20, 
                    height: 1, 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    margin: '4px 0'
                }} />
                
                <SidebarButton 
                    icon={isDark ? Moon : Sun} 
                    active={false}
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    isDark={isDark}
                    title="Theme"
                />
            </div>

            {/* Bottom Toolbar - Figma Style */}
            {activeView === 'canvas' && (
                <div 
                    style={{
                        position: 'fixed',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: 6,
                        borderRadius: 12,
                        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    }}
                >
                    {tools.map((tool, index) => (
                        <React.Fragment key={tool.id}>
                            {/* Separator after pen tool */}
                            {index === 4 && (
                                <div style={{ 
                                    width: 1, 
                                    height: 24, 
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    margin: '0 4px'
                                }} />
                            )}
                            {/* Separator before comment */}
                            {index === 9 && (
                                <div style={{ 
                                    width: 1, 
                                    height: 24, 
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    margin: '0 4px'
                                }} />
                            )}
                            <ToolButton
                                icon={tool.icon}
                                active={activeTool === tool.id}
                                isDark={isDark}
                                title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                                onClick={() => setActiveTool(tool.id)}
                                draggable={!!tool.nodeType}
                                onDragStart={tool.nodeType ? (e) => onDragStart(e, tool.nodeType!) : undefined}
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}
        </>
    );
}

function SidebarButton({ 
    icon: Icon, 
    active, 
    onClick, 
    isDark, 
    title 
}: { 
    icon: React.ElementType; 
    active: boolean; 
    onClick: () => void; 
    isDark: boolean;
    title: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: 'none',
                backgroundColor: active ? '#3b82f6' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
            }}
        >
            <Icon 
                size={18} 
                strokeWidth={1.5}
                color={active ? 'white' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)')} 
            />
        </button>
    );
}

function ToolButton({ 
    icon: Icon, 
    active, 
    isDark, 
    title,
    onClick,
    draggable,
    onDragStart
}: { 
    icon: React.ElementType; 
    active: boolean; 
    isDark: boolean;
    title: string;
    onClick: () => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            draggable={draggable}
            onDragStart={onDragStart}
            style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                backgroundColor: active ? '#3b82f6' : 'transparent',
                cursor: draggable ? 'grab' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
            }}
        >
            <Icon 
                size={18} 
                strokeWidth={1.5}
                color={active ? 'white' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)')} 
            />
        </button>
    );
}
