"use client"

import { useTheme } from 'next-themes';
import { Plus, MoreHorizontal, Pencil, Palette, X, Trash2 } from 'lucide-react';
import { useBoardStore, Column, Task, BlockType } from '@/store/useBoardStore';
import { KanbanCard } from './KanbanCard';
import { KanbanBlock } from './KanbanBlock';

interface KanbanColumnProps {
    column: Column;
    boardId: string;
    // Rename props
    isRenaming: boolean;
    renameValue: string;
    onRenameStart: (column: { id: string; title: string }) => void;
    onRenameChange: (value: string) => void;
    onRenameSubmit: (columnId: string) => void;
    // Menu props
    isMenuOpen: boolean;
    isColorPickerOpen: boolean;
    onMenuToggle: () => void;
    onColorPickerToggle: () => void;
    onCloseMenu: () => void;
    menuRef: React.RefObject<HTMLDivElement | null>;
    // Task actions
    openNewTaskModal: (columnId: string) => void;
    openEditTaskModal: (task: Task, columnId: string) => void;
    
    // Unified Actions
    onDragItemStart: (item: any, columnId: string) => void;
    onDragItemEnd: () => void;
    onItemDrop: (columnId: string) => void;
}

export function KanbanColumn({
    column,
    boardId,
    isRenaming,
    renameValue,
    onRenameStart,
    onRenameChange,
    onRenameSubmit,
    isMenuOpen,
    isColorPickerOpen,
    onMenuToggle,
    onColorPickerToggle,
    onCloseMenu,
    menuRef,
    openNewTaskModal,
    openEditTaskModal,
    onDragItemStart,
    onDragItemEnd,
    onItemDrop,
}: KanbanColumnProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const store = useBoardStore();

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const columnBg = isDark ? 'rgba(255,255,255,0.02)' : '#f5f5f5';
    //const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
    // Passing borderColor as it is used in inline styles often
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';

    const handleClearColumnTasks = () => {
        column.items.forEach(item => {
            if (item.kind === 'task') {
                store.deleteItem(boardId, column.id, item.id);
            }
        });
        onCloseMenu();
    };

    const handleColorChange = (color: string) => {
        store.updateColumn(boardId, column.id, { color });
    };

    const handleDelete = () => {
        store.deleteColumn(boardId, column.id);
    };

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                const types = e.dataTransfer.types;
                if (types.includes('text/plain') || types.includes('application/block-type')) {
                    e.currentTarget.style.boxShadow = '0 0 0 2px #8b5cf6 inset';
                }
            }}
            onDragLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
            onDrop={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                
                // Allow default handling?
                // Depending on requirement, we might want to let parent handle `onDrop` for sorting?
                // But here we handle dropping of NEW blocks.
                
                try {
                    const rawData = e.dataTransfer.getData('application/json');
                    if (rawData) {
                         // Check move block - unified
                        // If we drag a block from another column, it is now an 'item' move.
                        // Ideally we use the same `onDragItemStart` logic.
                        // But if it's coming from a "Widget Palette" (if that exists?), it might be different.
                        // Assuming palette still uses BlockType drops.
                    }
                } catch (err) {
                    // Ignore
                }

                const blockType = e.dataTransfer.getData('text/plain') as BlockType;
                const validTypes: BlockType[] = ['heading', 'text', 'checklist', 'divider', 'quote'];
                if (blockType && validTypes.includes(blockType)) {
                    e.preventDefault();
                    store.addBlockToColumn(boardId, column.id, blockType);
                } else {
                    // Item drop
                     onItemDrop(column.id);
                }
            }}
            style={{
                minWidth: 280,
                maxWidth: 280,
                backgroundColor: `${column.color}08`,
                borderRadius: 12,
                padding: 12,
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.15s ease',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}`, // Adding subtle border for better definition
            }}
        >
            {/* Column Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                padding: '0 4px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: column.color,
                    }} />
                    
                    {isRenaming ? (
                        <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onChange={(e) => onRenameChange(e.target.value)}
                            onBlur={() => onRenameSubmit(column.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onRenameSubmit(column.id);
                            }}
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: textPrimary,
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                            }}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <h3 style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: textPrimary,
                                margin: 0,
                            }}>
                                {column.title}
                            </h3>
                            <span style={{
                                fontSize: 11,
                                color: textMuted,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                padding: '1px 6px',
                                borderRadius: 10,
                            }}>
                                {column.items.filter(i => i.kind === 'task').length}
                            </span>
                        </div>
                    )}
                </div>
                <div ref={isMenuOpen || isColorPickerOpen ? menuRef : null} style={{ display: 'flex', gap: 4, position: 'relative' }}>
                    <button
                        onClick={() => openNewTaskModal(column.id)}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={onMenuToggle}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: isMenuOpen ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                            color: textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {/* Column Menu Dropdown */}
                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 4,
                            width: 180,
                            backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            border: `1px solid ${borderColor}`,
                            padding: 6,
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}>
                            <button
                                onClick={() => {
                                    onRenameStart({ id: column.id, title: column.title });
                                    onCloseMenu();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: textPrimary,
                                    fontSize: 13,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Pencil size={14} /> Rename
                            </button>
                            <button
                                onClick={() => {
                                    onColorPickerToggle();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: textPrimary,
                                    fontSize: 13,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Palette size={14} /> Change Color
                            </button>
                            <button
                                onClick={handleClearColumnTasks}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: textPrimary,
                                    fontSize: 13,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <X size={14} /> Clear Tasks
                            </button>
                            <div style={{ height: 1, backgroundColor: borderColor, margin: '4px 0' }} />
                            <button
                                onClick={handleDelete}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    fontSize: 13,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Trash2 size={14} /> Delete Column
                            </button>
                        </div>
                    )}

                    {/* Color Picker */}
                    {isColorPickerOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 4,
                            width: 200,
                            backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            border: `1px solid ${borderColor}`,
                            padding: 12,
                            zIndex: 50,
                        }}>
                             <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: 8,
                            }}>
                                {['#6b7280', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#d946ef'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            handleColorChange(color);
                                            onCloseMenu(); // This closes color picker too because parent tracks state
                                        }}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 6,
                                            backgroundColor: color,
                                            border: column.color === color ? '2px solid white' : 'none',
                                            cursor: 'pointer',
                                            boxShadow: column.color === color ? '0 0 0 2px rgba(0,0,0,0.3)' : 'none',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
            }}>
                {column.items.map((item, index) => {
                    if (item.kind === 'task') {
                        return (
                            <KanbanCard
                                key={item.id}
                                task={item}
                                columnColor={column.color}
                                columnId={column.id}
                                boardId={boardId}
                                index={index}
                                onDragStart={() => onDragItemStart(item, column.id)}
                                onDragEnd={onDragItemEnd}
                                onClick={() => openEditTaskModal(item, column.id)}
                            />
                        );
                    } else if (item.kind === 'block') {
                        return (
                            <KanbanBlock
                                key={item.id}
                                block={item}
                                columnId={column.id}
                                index={index}
                                boardId={boardId}
                                onDragStart={(e) => onDragItemStart(item, column.id)}
                                onDragEnd={onDragItemEnd}
                            />
                        );
                    }
                    return null;
                })}

                {/* Add new button */}
                <button
                    onClick={() => openNewTaskModal(column.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: textMuted,
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'all 0.15s ease',
                    }}
                >
                    <Plus size={14} />
                    Add new
                </button>
            </div>
        </div>
    );
}
