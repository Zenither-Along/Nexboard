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
  PenTool,
  Trash2,
  Slash,
  ArrowUpRight,
  Circle,
  Triangle,
  Star,
  ChevronDown,
  Check
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import useStore, { Tool } from '@/store/useStore';

export function Toolbar() {
    const { setTheme, resolvedTheme } = useTheme();
    const { activeView, setActiveView } = useAppStore();
    const { activeTool, setActiveTool, nodes, onNodesChange } = useStore();
    const isDark = resolvedTheme === 'dark';

    // State for shapes menu
    const [isShapesMenuOpen, setIsShapesMenuOpen] = useState(false);
    const shapesMenuRef = useRef<HTMLDivElement>(null);
    
    // Track last used shape to display in the main bar
    const [lastUsedShape, setLastUsedShape] = useState<Tool>('rectangle');
    
    // Check if current active tool is a shape
    const isShapeActive = ['rectangle', 'line', 'arrow', 'ellipse', 'polygon', 'star', 'polaroid'].includes(activeTool);
    
    // Update last used shape when active tool changes to a shape
    useEffect(() => {
        if (isShapeActive) {
            setLastUsedShape(activeTool);
        }
    }, [activeTool, isShapeActive]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shapesMenuRef.current && !shapesMenuRef.current.contains(event.target as Node)) {
                setIsShapesMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check if any nodes are selected
    const hasSelectedNodes = nodes.some(node => node.selected);

    // Delete selected nodes
    const deleteSelectedNodes = useCallback(() => {
        const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
        if (selectedNodeIds.length > 0) {
            onNodesChange(selectedNodeIds.map(id => ({ type: 'remove' as const, id })));
        }
    }, [nodes, onNodesChange]);

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
                case 'o': setActiveTool('ellipse'); break;
                case 'l': 
                    if (e.shiftKey) {
                        setActiveTool('arrow');
                    } else {
                        setActiveTool('line');
                    }
                    break;
                case 't': setActiveTool('text'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Shapes list
    const shapes = [
        { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
        { id: 'line', icon: Slash, label: 'Line', shortcut: 'L' },
        { id: 'arrow', icon: ArrowUpRight, label: 'Arrow', shortcut: '⇧L' },
        { id: 'ellipse', icon: Circle, label: 'Ellipse', shortcut: 'O' },
        { id: 'polygon', icon: Triangle, label: 'Polygon', shortcut: '' },
        { id: 'star', icon: Star, label: 'Star', shortcut: '' },
    ];

    // Current shape icon
    const CurrentShapeIcon = shapes.find(s => s.id === lastUsedShape)?.icon || Square;

    // Bottom toolbar tools (Figma-style)
    // Note: removed rectangle and polaroid as they are now in the shapes menu
    const tools: { id: Tool | 'shapes'; icon: React.ElementType; label: string; shortcut: string; nodeType?: string }[] = [
        { id: 'select', icon: MousePointer2, label: 'Move', shortcut: 'V' },
        { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
        { id: 'pencil', icon: Pencil, label: 'Pencil', shortcut: 'P' },
        { id: 'pen', icon: PenTool, label: 'Pen', shortcut: '⇧P' },
        { id: 'frame', icon: Frame, label: 'Frame', shortcut: 'F', nodeType: 'frameNode' },
        // Shapes group
        { id: 'shapes', icon: CurrentShapeIcon, label: 'Shapes', shortcut: '' },
        { id: 'text', icon: Type, label: 'Text', shortcut: 'T', nodeType: 'textNode' },
        { id: 'polaroid', icon: ImageIcon, label: 'Polaroid', shortcut: '', nodeType: 'polaroidNode' },
        { id: 'sticky', icon: StickyNote, label: 'Sticky', shortcut: '', nodeType: 'stickyNote' },
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
                            {/* Separator before comment (now index 8 because we removed one item) */}
                            {index === 8 && (
                                <div style={{ 
                                    width: 1, 
                                    height: 24, 
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    margin: '0 4px'
                                }} />
                            )}
                            
                            {tool.id === 'shapes' ? (
                                <div className="relative" ref={shapesMenuRef}>
                                    <div className="flex items-center gap-0.5">
                                        <ToolButton
                                            icon={tool.icon}
                                            active={isShapeActive}
                                            isDark={isDark}
                                            title="Shapes"
                                            onClick={() => setActiveTool(lastUsedShape)}
                                            hasDropdown
                                        />
                                        <button
                                            onClick={() => setIsShapesMenuOpen(!isShapesMenuOpen)}
                                            style={{
                                                width: 20,
                                                height: 36,
                                                borderRadius: 8,
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.15s ease',
                                                marginLeft: -2,
                                            }}
                                            className="hover:bg-black/5 dark:hover:bg-white/10"
                                        >
                                            <ChevronDown size={14} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} />
                                        </button>
                                    </div>

                                    {/* Shapes Floating Widget */}
                                    {isShapesMenuOpen && (
                                        <div 
                                            // Using inline styles to GUARANTEE the specific "widget" look
                                            // regardless of Tailwind config issues
                                            style={{
                                                position: 'absolute',
                                                bottom: '100%',
                                                left: '50%',
                                                transform: 'translate(-50%, 0)', // Fix centering
                                                marginBottom: '16px',
                                                width: '220px',
                                                padding: '8px',
                                                borderRadius: '24px', // Deep rounded corners
                                                backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(20px)',
                                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                                                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0px',
                                                zIndex: 1000,
                                                transformOrigin: 'bottom center',
                                                animation: 'in 0.2s ease-out forwards',
                                            }}
                                            className="animate-in fade-in slide-in-from-bottom-4"
                                        >
                                            {shapes.map((shape) => (
                                                <button
                                                    key={shape.id}
                                                    onClick={() => {
                                                        setActiveTool(shape.id as Tool);
                                                        setLastUsedShape(shape.id as Tool);
                                                        setIsShapesMenuOpen(false);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '8px 12px',
                                                        borderRadius: '16px', // Button rounded corners
                                                        border: 'none',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        backgroundColor: activeTool === shape.id 
                                                            ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                                                            : 'transparent',
                                                        color: activeTool === shape.id 
                                                            ? (isDark ? '#60a5fa' : '#2563eb')
                                                            : (isDark ? '#e4e4e7' : '#52525b'),
                                                        transition: 'all 0.1s ease',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (activeTool !== shape.id) {
                                                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                                                            e.currentTarget.style.color = isDark ? '#ffffff' : '#000000';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (activeTool !== shape.id) {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.color = isDark ? '#e4e4e7' : '#52525b';
                                                        }
                                                    }}
                                                >
                                                    {/* Check/Icon Column */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        opacity: activeTool === shape.id ? 1 : 0,
                                                        transform: activeTool === shape.id ? 'scale(1)' : 'scale(0.8)',
                                                        transition: 'all 0.2s ease',
                                                    }}>
                                                        <Check size={16} strokeWidth={3} />
                                                    </div>
                                                    
                                                    {/* Icon + Label */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        paddingLeft: '30px',
                                                        flex: 1,
                                                    }}>
                                                        <shape.icon 
                                                            size={18} 
                                                            strokeWidth={2} 
                                                            style={{
                                                                opacity: activeTool === shape.id ? 1 : 0.7,
                                                                transform: activeTool === shape.id ? 'scale(1.1)' : 'scale(1)',
                                                                transition: 'all 0.2s ease',
                                                            }}
                                                        />
                                                        <span style={{ 
                                                            fontSize: '14px', 
                                                            fontWeight: activeTool === shape.id ? 500 : 400 
                                                        }}>{shape.label}</span>
                                                    </div>
                                                    
                                                    {/* Shortcut */}
                                                    {shape.shortcut && (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            opacity: 0.5,
                                                            fontFamily: 'monospace',
                                                            fontWeight: 600,
                                                            marginLeft: 'auto',
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                        }}>
                                                            {shape.shortcut}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <ToolButton
                                    icon={tool.icon}
                                    active={activeTool === tool.id}
                                    isDark={isDark}
                                    title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                                    onClick={() => setActiveTool(tool.id as Tool)}
                                    draggable={!!tool.nodeType}
                                    onDragStart={tool.nodeType ? (e) => onDragStart(e, tool.nodeType!) : undefined}
                                />
                            )}
                        </React.Fragment>
                    ))}
                    
                    {/* Separator before delete */}
                    <div style={{ 
                        width: 1, 
                        height: 24, 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        margin: '0 4px'
                    }} />
                    
                    {/* Delete Button */}
                    <button
                        onClick={deleteSelectedNodes}
                        title="Delete selected (Del)"
                        disabled={!hasSelectedNodes}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: hasSelectedNodes ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            opacity: hasSelectedNodes ? 1 : 0.5,
                        }}
                    >
                        <Trash2 
                            size={18} 
                            strokeWidth={1.5}
                            color={hasSelectedNodes ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')} 
                        />
                    </button>
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
    onDragStart,
    hasDropdown
}: { 
    icon: React.ElementType; 
    active: boolean; 
    isDark: boolean;
    title: string;
    onClick: () => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    hasDropdown?: boolean;
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
