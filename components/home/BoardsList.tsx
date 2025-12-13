"use client"

import { useState, useEffect, useRef } from 'react';
import { Plus, MoreHorizontal, Folder, Clock, ChevronRight, Pencil, Trash2, Smile } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useBoardStore, Board } from '@/store/useBoardStore';
import { EmojiPickerPopup } from '@/components/ui/EmojiPickerPopup';

export function BoardsList() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { boards, selectBoard, addBoard, updateBoard, deleteBoard } = useBoardStore();
    const [showNewBoard, setShowNewBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    
    // Board menu state
    const [openBoardMenu, setOpenBoardMenu] = useState<string | null>(null);
    const [renamingBoard, setRenamingBoard] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [iconPickerBoard, setIconPickerBoard] = useState<string | null>(null);
    const boardMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (boardMenuRef.current && !boardMenuRef.current.contains(e.target as Node)) {
                setOpenBoardMenu(null);
            }
        };
        if (openBoardMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openBoardMenu]);

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';

    const handleCreateBoard = () => {
        if (newBoardName.trim()) {
            addBoard(newBoardName.trim());
            setNewBoardName('');
            setShowNewBoard(false);
        }
    };

    const getTotalTasks = (board: Board) => {
        return board.columns.reduce((acc, col) => acc + col.items.filter(i => i.kind === 'task').length, 0);
    };

    // Board menu handlers
    const handleStartRename = (board: Board) => {
        setRenameValue(board.name);
        setRenamingBoard(board.id);
        setOpenBoardMenu(null);
    };

    const handleBoardRename = (boardId: string) => {
        if (renameValue.trim()) {
            updateBoard(boardId, { name: renameValue.trim() });
        }
        setRenamingBoard(null);
        setRenameValue('');
    };

    const handleBoardIconChange = (boardId: string, icon: string) => {
        updateBoard(boardId, { icon });
        setIconPickerBoard(null);
    };

    const handleDeleteBoard = (boardId: string) => {
        if (confirm('Delete this board and all its columns and tasks?')) {
            deleteBoard(boardId);
        }
        setOpenBoardMenu(null);
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 32,
            }}>
                <div>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 600,
                        color: textPrimary,
                        letterSpacing: '-0.02em',
                        marginBottom: 4,
                    }}>
                        All Boards
                    </h1>
                    <p style={{ fontSize: 14, color: textSecondary }}>
                        {boards.length} boards • Manage your projects
                    </p>
                </div>
                <button
                    onClick={() => setShowNewBoard(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: 'none',
                        backgroundColor: isDark ? '#ffffff' : '#0a0a0a',
                        color: isDark ? '#0a0a0a' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                    }}
                >
                    <Plus size={18} />
                    New Board
                </button>
            </div>

            {/* New Board Input */}
            {showNewBoard && (
                <div style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    display: 'flex',
                    gap: 12,
                }}>
                    <input
                        type="text"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                        placeholder="Board name..."
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: 'transparent',
                            color: textPrimary,
                            fontSize: 14,
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleCreateBoard}
                        style={{
                            padding: '10px 18px',
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        Create
                    </button>
                    <button
                        onClick={() => setShowNewBoard(false)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: 8,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: 'transparent',
                            color: textSecondary,
                            cursor: 'pointer',
                            fontSize: 14,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Boards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
                paddingBottom: 80,
            }}>
                {boards.map(board => (
                    <div
                        key={board.id}
                        onClick={() => {
                            if (!openBoardMenu && !renamingBoard && !iconPickerBoard) {
                                selectBoard(board.id);
                            }
                        }}
                        style={{
                            backgroundColor: cardBg,
                            border: `1px solid ${borderColor}`,
                            borderRadius: 14,
                            padding: 20,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Board Icon & Menu */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 16,
                        }}>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIconPickerBoard(iconPickerBoard === board.id ? null : board.id);
                                    setOpenBoardMenu(null);
                                }}
                                style={{
                                    fontSize: 32,
                                    width: 56,
                                    height: 56,
                                    borderRadius: 12,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                                title="Click to change icon"
                            >
                                {board.icon}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenBoardMenu(openBoardMenu === board.id ? null : board.id);
                                    setIconPickerBoard(null);
                                }}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    border: 'none',
                                    backgroundColor: openBoardMenu === board.id ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                    color: textMuted,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        {/* Board Menu Dropdown */}
                        {openBoardMenu === board.id && (
                            <div 
                                ref={boardMenuRef}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    top: 70,
                                    right: 20,
                                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: 10,
                                    padding: 6,
                                    minWidth: 160,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    zIndex: 100,
                                }}
                            >
                                <button
                                    onClick={() => handleStartRename(board)}
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
                                        setIconPickerBoard(board.id);
                                        setOpenBoardMenu(null);
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
                                    <Smile size={14} /> Change Icon
                                </button>
                                <div style={{ height: 1, backgroundColor: borderColor, margin: '4px 0' }} />
                                <button
                                    onClick={() => handleDeleteBoard(board.id)}
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
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <Trash2 size={14} /> Delete Board
                                </button>
                            </div>
                        )}

                        {/* Emoji Picker */}
                        <div style={{ position: 'relative' }}>
                            <EmojiPickerPopup
                                isOpen={iconPickerBoard === board.id}
                                onClose={() => setIconPickerBoard(null)}
                                onSelect={(emoji) => handleBoardIconChange(board.id, emoji)}
                            />
                        </div>

                        {/* Board Name */}
                        {renamingBoard === board.id ? (
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleBoardRename(board.id);
                                    if (e.key === 'Escape') setRenamingBoard(null);
                                }}
                                onBlur={() => handleBoardRename(board.id)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: textPrimary,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '4px 8px',
                                    marginBottom: 4,
                                    outline: 'none',
                                    width: '100%',
                                }}
                            />
                        ) : (
                            <h3 
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename(board);
                                }}
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: textPrimary,
                                    marginBottom: 4,
                                }}
                                title="Double-click to rename"
                            >
                                {board.name}
                            </h3>
                        )}

                        {/* Description */}
                        {board.description && (
                            <p style={{
                                fontSize: 13,
                                color: textSecondary,
                                marginBottom: 16,
                                lineHeight: 1.4,
                            }}>
                                {board.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            paddingTop: 16,
                            borderTop: `1px solid ${borderColor}`,
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <Folder size={14} color={textMuted} />
                                <span style={{ fontSize: 12, color: textSecondary }}>
                                    {getTotalTasks(board)} tasks
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <Clock size={14} color={textMuted} />
                                <span style={{ fontSize: 12, color: textSecondary }}>
                                    {board.columns.length} columns
                                </span>
                            </div>
                            <ChevronRight 
                                size={16} 
                                color={textMuted} 
                                style={{ marginLeft: 'auto' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
