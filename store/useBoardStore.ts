import { create } from 'zustand';

// Content block types for Notion-like blocks
export type BlockType = 'heading' | 'text' | 'checklist' | 'divider' | 'quote';

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface ContentBlock {
    id: string;
    type: BlockType;
    content?: string;          // For heading, text, quote
    items?: ChecklistItem[];   // For checklist
}

export interface Task {
    id: string;
    title: string;
    client?: string;
    assignee?: string;
    tags: { label: string; color: string }[];
    comments: number;
    attachments: number;
    progress?: number;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
}

export type ColumnItem = 
    | ({ kind: 'task' } & Task)
    | ({ kind: 'block' } & ContentBlock);

export interface Column {
    id: string;
    title: string;
    color: string;
    items: ColumnItem[];
}

export interface Board {
    id: string;
    name: string;
    icon: string;
    description?: string;
    columns: Column[];
    createdAt: Date;
}

interface BoardStore {
    boards: Board[];
    selectedBoardId: string | null;
    
    // Actions
    selectBoard: (id: string | null) => void;
    addBoard: (name: string, icon?: string) => void;
    deleteBoard: (id: string) => void;
    updateBoard: (id: string, updates: Partial<Board>) => void;
    
    // Column actions
    addColumn: (boardId: string, title: string, color?: string) => void;
    updateColumn: (boardId: string, columnId: string, updates: Partial<Column>) => void;
    deleteColumn: (boardId: string, columnId: string) => void;
    clearColumn: (boardId: string, columnId: string) => void;
    
    // Generic Item actions
    moveItem: (boardId: string, itemId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
    deleteItem: (boardId: string, columnId: string, itemId: string) => void;

    // Task actions
    addTask: (boardId: string, columnId: string, task: Omit<Task, 'id'>) => void;
    updateTask: (boardId: string, columnId: string, taskId: string, updates: Partial<Task>) => void;
    
    // Block actions
    addBlockToColumn: (boardId: string, columnId: string, blockType: BlockType) => void;
    updateColumnBlock: (boardId: string, columnId: string, blockId: string, updates: Partial<ContentBlock>) => void;
    toggleColumnChecklistItem: (boardId: string, columnId: string, blockId: string, itemId: string) => void;
    addColumnChecklistItem: (boardId: string, columnId: string, blockId: string, text: string) => void;
}

const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do', color: '#6b7280', items: [] },
    { id: 'progress', title: 'In Progress', color: '#f59e0b', items: [] },
    { id: 'review', title: 'In Review', color: '#8b5cf6', items: [] },
    { id: 'completed', title: 'Completed', color: '#10b981', items: [] },
];

const sampleBoards: Board[] = [
    {
        id: '1',
        name: 'Project UI/UX',
        icon: '🎨',
        description: 'Design and user experience improvements',
        createdAt: new Date(),
        columns: [
            {
                id: 'todo',
                title: 'To Do',
                color: '#6b7280',
                items: [
                    {
                        kind: 'task',
                        id: '1',
                        title: 'Change top CTA button text',
                        client: 'Stellar',
                        assignee: 'Phoenix Baker',
                        tags: [
                            { label: 'Web', color: '#3b82f6' },
                            { label: 'Saas', color: '#ef4444' },
                        ],
                        comments: 2,
                        attachments: 4,
                        progress: 50,
                        dueDate: '4d',
                    },
                    {
                        kind: 'task',
                        id: '2',
                        title: 'Redesign analytics dashboard',
                        client: 'Stellar',
                        assignee: 'Phoenix Baker',
                        tags: [
                            { label: 'Saas', color: '#ef4444' },
                            { label: 'Mobile', color: '#8b5cf6' },
                        ],
                        comments: 2,
                        attachments: 4,
                        progress: 50,
                        dueDate: '4d',
                    },
                ],
            },
            {
                id: 'progress',
                title: 'In Progress',
                color: '#f59e0b',
                items: [
                    {
                        kind: 'task',
                        id: '3',
                        title: 'Redesign news page',
                        client: 'Stellar',
                        assignee: 'Phoenix Baker',
                        tags: [{ label: 'Web', color: '#3b82f6' }],
                        comments: 2,
                        attachments: 4,
                        progress: 50,
                        dueDate: '4d',
                    },
                ],
            },
            {
                id: 'review',
                title: 'In Review',
                color: '#8b5cf6',
                items: [
                    {
                        kind: 'task',
                        id: '4',
                        title: 'UI Animation for onboarding',
                        client: 'Stellar',
                        assignee: 'Phoenix Baker',
                        tags: [
                            { label: 'Web', color: '#3b82f6' },
                            { label: 'Saas', color: '#ef4444' },
                        ],
                        comments: 2,
                        attachments: 4,
                        progress: 50,
                        dueDate: '4d',
                    },
                ],
            },
            {
                id: 'completed',
                title: 'Completed',
                color: '#10b981',
                items: [
                    {
                        kind: 'task',
                        id: '5',
                        title: 'Navigation improvements',
                        client: 'Taskez',
                        assignee: 'Phoenix Baker',
                        tags: [],
                        comments: 2,
                        attachments: 4,
                        progress: 100,
                    },
                ],
            },
        ],
    },
    {
        id: '2',
        name: 'Marketing Campaign',
        icon: '📢',
        description: 'Q1 marketing initiatives',
        createdAt: new Date(),
        columns: defaultColumns.map(col => ({ ...col, items: [] })),
    },
    {
        id: '3',
        name: 'Product Roadmap',
        icon: '🗺️',
        description: 'Feature planning and development',
        createdAt: new Date(),
        columns: defaultColumns.map(col => ({ ...col, items: [] })),
    },
    {
        id: '4',
        name: 'Bug Fixes',
        icon: '🐛',
        description: 'Bug tracking and resolution',
        createdAt: new Date(),
        columns: defaultColumns.map(col => ({ ...col, items: [] })),
    },
];

export const useBoardStore = create<BoardStore>((set, get) => ({
    boards: sampleBoards,
    selectedBoardId: null,

    selectBoard: (id) => set({ selectedBoardId: id }),

    addBoard: (name, icon = '📋') => {
        const newBoard: Board = {
            id: Date.now().toString(),
            name,
            icon,
            createdAt: new Date(),
            columns: defaultColumns.map(col => ({ ...col, id: `${col.id}-${Date.now()}`, items: [] })),
        };
        set(state => ({ boards: [...state.boards, newBoard] }));
    },

    deleteBoard: (id) => {
        set(state => ({
            boards: state.boards.filter(b => b.id !== id),
            selectedBoardId: state.selectedBoardId === id ? null : state.selectedBoardId,
        }));
    },

    updateBoard: (id, updates) => {
        set(state => ({
            boards: state.boards.map(b => b.id === id ? { ...b, ...updates } : b),
        }));
    },

    // ----------------------------------------------------------------------
    // Column Actions
    // ----------------------------------------------------------------------

    addColumn: (boardId, title, color = '#6b7280') => {
        const newColumn: Column = {
            id: Date.now().toString(),
            title,
            color,
            items: [],
        };
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return { ...board, columns: [...board.columns, newColumn] };
            }),
        }));
    },

    updateColumn: (boardId, columnId, updates) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col =>
                        col.id === columnId ? { ...col, ...updates } : col
                    ),
                };
            }),
        }));
    },

    deleteColumn: (boardId, columnId) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.filter(col => col.id !== columnId),
                };
            }),
        }));
    },

    clearColumn: (boardId, columnId) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col =>
                        col.id === columnId ? { ...col, items: [] } : col
                    ),
                };
            }),
        }));
    },

    // ----------------------------------------------------------------------
    // Item Actions (Generic)
    // ----------------------------------------------------------------------

    moveItem: (boardId, itemId, fromColumnId, toColumnId, newIndex) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;

                const fromCol = board.columns.find(c => c.id === fromColumnId);
                const toCol = board.columns.find(c => c.id === toColumnId);
                if (!fromCol || !toCol) return board;

                const itemToMove = fromCol.items.find(i => i.id === itemId);
                if (!itemToMove) return board;

                // Create new columns array
                const newColumns = board.columns.map(col => {
                    let newItems = [...col.items];

                    // Remove from source
                    if (col.id === fromColumnId) {
                        newItems = newItems.filter(i => i.id !== itemId);
                    }

                    // Add to destination
                    if (col.id === toColumnId) {
                        // If same column, we need to adjust index because we just removed it
                        let insertIndex = newIndex;
                        // Actually, if we filter first, the array might be shift.
                        // But usually moveItem is called with the intent of "place it at index X of the list *without* the item".
                        // Drag and drop libraries usually give destination index.
                        
                        // Safety check
                        if (insertIndex < 0) insertIndex = 0;
                        if (insertIndex > newItems.length) insertIndex = newItems.length;
                        
                        newItems.splice(insertIndex, 0, itemToMove);
                    }

                    return { ...col, items: newItems };
                });

                return { ...board, columns: newColumns };
            }),
        }));
    },

    deleteItem: (boardId, columnId, itemId) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return { ...col, items: col.items.filter(i => i.id !== itemId) };
                    }),
                };
            }),
        }));
    },

    // ----------------------------------------------------------------------
    // Task Actions
    // ----------------------------------------------------------------------

    addTask: (boardId, columnId, task) => {
        const newItem: ColumnItem = { 
            kind: 'task', 
            ...task, 
            id: Date.now().toString() 
        };
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return { ...col, items: [...col.items, newItem] };
                    }),
                };
            }),
        }));
    },

    updateTask: (boardId, columnId, taskId, updates) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return {
                            ...col,
                            items: col.items.map(item => {
                                if (item.kind === 'task' && item.id === taskId) {
                                    return { ...item, ...updates };
                                }
                                return item;
                            }),
                        };
                    }),
                };
            }),
        }));
    },

    // ----------------------------------------------------------------------
    // Block Actions
    // ----------------------------------------------------------------------

    addBlockToColumn: (boardId, columnId, blockType) => {
        const newBlock: ColumnItem = {
            kind: 'block',
            id: Date.now().toString(),
            type: blockType,
            content: blockType === 'heading' ? 'New Heading' : blockType === 'text' ? '' : blockType === 'quote' ? '' : undefined,
            items: blockType === 'checklist' ? [] : undefined,
        };
        
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return {
                            ...col,
                            items: [...col.items, newBlock],
                        };
                    }),
                };
            }),
        }));
    },

    updateColumnBlock: (boardId, columnId, blockId, updates) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return {
                            ...col,
                            items: col.items.map(item => {
                                if (item.kind === 'block' && item.id === blockId) {
                                    return { ...item, ...updates };
                                }
                                return item;
                            }),
                        };
                    }),
                };
            }),
        }));
    },

    toggleColumnChecklistItem: (boardId, columnId, blockId, itemId) => {
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return {
                            ...col,
                            items: col.items.map(item => {
                                if (item.kind !== 'block' || item.id !== blockId || item.type !== 'checklist') return item;
                                return {
                                    ...item,
                                    items: (item.items || []).map(i =>
                                        i.id === itemId ? { ...i, checked: !i.checked } : i
                                    ),
                                };
                            }),
                        };
                    }),
                };
            }),
        }));
    },

    addColumnChecklistItem: (boardId, columnId, blockId, text) => {
        const newItem: ChecklistItem = {
            id: Date.now().toString(),
            text,
            checked: false,
        };
        
        set(state => ({
            boards: state.boards.map(board => {
                if (board.id !== boardId) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnId) return col;
                        return {
                            ...col,
                            items: col.items.map(item => {
                                if (item.kind !== 'block' || item.id !== blockId || item.type !== 'checklist') return item;
                                return {
                                    ...item,
                                    items: [...(item.items || []), newItem],
                                };
                            }),
                        };
                    }),
                };
            }),
        }));
    },
}));
