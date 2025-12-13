"use client"

import { useState, useEffect, useRef } from 'react';
import { Plus, ArrowLeft, LayoutGrid, List, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useBoardStore, Task } from '@/store/useBoardStore';
import { TaskModal } from './TaskModal';
import { KanbanColumn } from './kanban/KanbanColumn';
import { KanbanList } from './kanban/KanbanList';

type ViewMode = 'board' | 'list';

export function KanbanBoard() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { boards, selectedBoardId, selectBoard, addTask, updateTask, addColumn, updateColumn, deleteColumn, moveItem, deleteItem, updateBoard } = useBoardStore();
    
    // Unified drag state
    const [draggedItem, setDraggedItem] = useState<{ item: any; columnId: string } | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('board');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editingColumnId, setEditingColumnId] = useState('');
    
    // Column menu state
    const [openColumnMenu, setOpenColumnMenu] = useState<string | null>(null);
    const [renamingColumn, setRenamingColumn] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [colorPickerColumn, setColorPickerColumn] = useState<string | null>(null);
    const columnMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
                setOpenColumnMenu(null);
                setColorPickerColumn(null);
            }
        };
        if (openColumnMenu || colorPickerColumn) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openColumnMenu, colorPickerColumn]);

    const selectedBoard = boards.find(b => b.id === selectedBoardId);

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';

    if (!selectedBoard) {
        return <div style={{ color: textSecondary, padding: 40, textAlign: 'center' }}>No board selected</div>;
    }

    const handleDragStart = (item: any, columnId: string) => {
        setDraggedItem({ item, columnId });
    };

    const handleDrop = (targetColumnId: string) => {
        if (!draggedItem || !selectedBoardId) return;
        
        if (draggedItem.columnId === targetColumnId) {
            // Even if same column, dropping on background might mean "move to end"
            // But usually we just clear state if it wasn't handled by a specific item drop zone
            setDraggedItem(null);
            return;
        }

        const targetColumn = selectedBoard.columns.find(c => c.id === targetColumnId);
        if (targetColumn) {
            moveItem(selectedBoardId, draggedItem.item.id, draggedItem.columnId, targetColumnId, targetColumn.items.length);
        }
        setDraggedItem(null);
    };

    // Open modal for new task
    const openNewTaskModal = (columnId: string) => {
        setEditingTask(null);
        setEditingColumnId(columnId);
        setIsModalOpen(true);
    };

    // Open modal for editing task
    const openEditTaskModal = (task: Task, columnId: string) => {
        setEditingTask(task);
        setEditingColumnId(columnId);
        setIsModalOpen(true);
    };

    // Handle save new task
    const handleSaveTask = (taskData: Omit<Task, 'id'>, columnId: string) => {
        if (!selectedBoardId) return;
        addTask(selectedBoardId, columnId, taskData);
    };

    // Handle update task
    const handleUpdateTask = (taskId: string, updates: Partial<Task>, newColumnId: string) => {
        if (!selectedBoardId) return;
        
        if (newColumnId !== editingColumnId) {
             const targetColumn = selectedBoard.columns.find(c => c.id === newColumnId);
             if (targetColumn) {
                 moveItem(selectedBoardId, taskId, editingColumnId, newColumnId, targetColumn.items.length);
             }
        }
        
        updateTask(selectedBoardId, newColumnId, taskId, updates);
    };

    // Handle delete task
    const handleDeleteTask = (taskId: string, columnId: string) => {
        if (!selectedBoardId) return;
        deleteItem(selectedBoardId, columnId, taskId);
    };

    // Column Actions
    const handleStartRename = (column: { id: string; title: string }) => {
        setRenamingColumn(column.id);
        setRenameValue(column.title);
        setOpenColumnMenu(null); // Close menu when starting rename
    };

    const handleColumnRename = (columnId: string) => {
        if (renameValue.trim() && selectedBoardId) {
            updateColumn(selectedBoardId, columnId, { title: renameValue.trim() });
        }
        setRenamingColumn(null);
        setRenameValue('');
    };

    const handleAddNewColumn = () => {
        if (selectedBoardId) {
            addColumn(selectedBoardId, 'New Column');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                padding: '0 4px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => selectBoard(null)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            color: textPrimary,
                            cursor: 'pointer',
                        }}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <span style={{ fontSize: 20 }}>{selectedBoard.icon}</span>
                            <input
                                type="text"
                                value={selectedBoard.name}
                                onChange={(e) => selectedBoardId && updateBoard(selectedBoardId, { name: e.target.value })}
                                style={{
                                    fontSize: 20,
                                    fontWeight: 600,
                                    color: textPrimary,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    minWidth: 200,
                                }}
                            />
                        </div>
                        <input
                            type="text"
                            value={selectedBoard.description || ''}
                            onChange={(e) => selectedBoardId && updateBoard(selectedBoardId, { description: e.target.value })}
                            placeholder="Add description..."
                            style={{
                                fontSize: 13,
                                color: textSecondary,
                                margin: '2px 0 0 0',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                minWidth: 300,
                            }}
                        />
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 8,
                    padding: 2,
                }}>
                    <button
                        onClick={() => setViewMode('board')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: viewMode === 'board' ? (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff') : 'transparent',
                            color: viewMode === 'board' ? textPrimary : textMuted,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 500,
                            boxShadow: viewMode === 'board' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <LayoutGrid size={14} />
                        Board
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: viewMode === 'list' ? (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff') : 'transparent',
                            color: viewMode === 'list' ? textPrimary : textMuted,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 500,
                            boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <List size={14} />
                        List
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={editingTask}
                    columnId={editingColumnId}
                    onSave={handleSaveTask}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    columns={selectedBoard.columns.map(c => ({ id: c.id, title: c.title, color: c.color }))}
                />
            )}

            {/* Kanban Board View */}
            {viewMode === 'board' && (
                <div style={{
                    display: 'flex',
                    gap: 16,
                    overflowX: 'auto',
                    paddingBottom: 50,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    flex: 1, // Ensure it takes remaining vertical space
                    alignItems: 'stretch',
                    minHeight: '100%',
                }}>
                    {selectedBoard.columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            boardId={selectedBoard.id}
                            isRenaming={renamingColumn === column.id}
                            renameValue={renamingColumn === column.id ? renameValue : ''}
                            onRenameStart={handleStartRename}
                            onRenameChange={setRenameValue}
                            onRenameSubmit={handleColumnRename}
                            isMenuOpen={openColumnMenu === column.id}
                            isColorPickerOpen={colorPickerColumn === column.id}
                            onMenuToggle={() => {
                                setOpenColumnMenu(openColumnMenu === column.id ? null : column.id);
                                setColorPickerColumn(null);
                            }}
                            onColorPickerToggle={() => {
                                setColorPickerColumn(colorPickerColumn === column.id ? null : column.id);
                                setOpenColumnMenu(null);
                            }}
                            onCloseMenu={() => {
                                setOpenColumnMenu(null);
                                setColorPickerColumn(null);
                            }}
                            menuRef={columnMenuRef}
                            openNewTaskModal={openNewTaskModal}
                            openEditTaskModal={openEditTaskModal}
                            
                            // Unified drag handlers
                            onDragItemStart={handleDragStart}
                            onDragItemEnd={() => setDraggedItem(null)}
                            onItemDrop={handleDrop}
                        />
                    ))}

                    {/* Add Column Button */}
                    <button
                        onClick={handleAddNewColumn}
                        style={{
                            minWidth: 280,
                            height: 60,
                            backgroundColor: 'transparent',
                            border: `2px dashed ${borderColor}`,
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            color: textMuted,
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = textSecondary;
                            e.currentTarget.style.color = textSecondary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.color = textMuted;
                        }}
                    >
                        <Plus size={18} />
                        Add Column
                    </button>
                </div>
            )}

            {viewMode === 'list' && (
                <KanbanList 
                    board={selectedBoard} 
                    onEditTask={openEditTaskModal}
                />
            )}

            {/* Trash Bin */}
            {draggedItem && (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.transform = 'translate(-50%, 0) scale(1.05)';
                    }}
                    onDragLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.borderColor = borderColor;
                        e.currentTarget.style.transform = 'translate(-50%, 0) scale(1)';
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Handle native drag drop from blocks (if still using native drag)
                        // Or if we strictly use react state now?
                        // If we use regular onDragStart, dataTransfer might be used.
                        // But I am using state (draggedItem).
                        // I will rely on state `draggedItem`.
                        
                        if (selectedBoardId && draggedItem) {
                            deleteItem(selectedBoardId, draggedItem.columnId, draggedItem.item.id);
                            setDraggedItem(null);
                        }
                    }}
                    style={{
                        position: 'fixed',
                        bottom: 40,
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        width: 200,
                        height: 80,
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: `2px dashed ${borderColor}`,
                        borderRadius: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: '#ef4444',
                        zIndex: 100,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                >
                    <Trash2 size={24} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Drop to delete</span>
                </div>
            )}
        </div>
    );
}
