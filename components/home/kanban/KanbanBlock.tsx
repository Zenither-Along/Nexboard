"use client"

import { useTheme } from 'next-themes';
import { CheckCircle2, Circle } from 'lucide-react';
import { useBoardStore, ContentBlock } from '@/store/useBoardStore';

interface KanbanBlockProps {
    block: ContentBlock;
    columnId: string;
    index: number;
    boardId: string;
    onDragStart: (e: React.DragEvent, blockId: string) => void;
    onDragEnd: () => void;
}

export function KanbanBlock({ block, columnId, index, boardId, onDragStart, onDragEnd }: KanbanBlockProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { updateColumnBlock, toggleColumnChecklistItem, addColumnChecklistItem, moveItem } = useBoardStore();

    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('application/json', JSON.stringify({ 
                    type: 'move-item', 
                    itemId: block.id, 
                    fromColumnId: columnId,
                    kind: 'block'
                }));
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(e, block.id);
            }}
            onDragEnd={onDragEnd}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.boxShadow = '0 -2px 0 0 #8b5cf6'; 
            }}
            onDragLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.boxShadow = 'none';
                
                try {
                    const rawData = e.dataTransfer.getData('application/json');
                    if (rawData) {
                        const data = JSON.parse(rawData);
                        if (data.type === 'move-item') {
                            moveItem(boardId, data.itemId, data.fromColumnId, columnId, index);
                        }
                    }
                } catch (err) {
                    // Ignore invalid data
                }
            }}
            style={{
                backgroundColor: cardBg,
                borderRadius: 10,
                padding: 12,
                border: `1px solid ${borderColor}`,
                cursor: 'grab',
                transition: 'box-shadow 0.1s ease',
            }}
        >
            {block.type === 'heading' && (
                <textarea
                    value={block.content || ''}
                    onChange={(e) => {
                        updateColumnBlock(boardId, columnId, block.id, { content: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    ref={(el) => {
                        if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                        }
                    }}
                    placeholder="Heading..."
                    rows={1}
                    style={{
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 600,
                        color: textPrimary,
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 0,
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        minHeight: 24,
                        fontFamily: 'inherit',
                    }}
                />
            )}
            {block.type === 'text' && (
                <textarea
                    value={block.content || ''}
                    onChange={(e) => {
                        updateColumnBlock(boardId, columnId, block.id, { content: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    ref={(el) => {
                        if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                        }
                    }}
                    placeholder="Enter text..."
                    rows={1}
                    style={{
                        width: '100%',
                        fontSize: 13,
                        color: textSecondary,
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 0,
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        minHeight: 20,
                        lineHeight: 1.5,
                        fontFamily: 'inherit',
                    }}
                />
            )}
            {block.type === 'quote' && (
                <div style={{
                    borderLeft: '3px solid #8b5cf6',
                    paddingLeft: 10,
                }}>
                    <textarea
                        value={block.content || ''}
                        onChange={(e) => {
                            updateColumnBlock(boardId, columnId, block.id, { content: e.target.value });
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        ref={(el) => {
                            if (el) {
                                el.style.height = 'auto';
                                el.style.height = `${el.scrollHeight}px`;
                            }
                        }}
                        placeholder="Quote..."
                        rows={1}
                        style={{
                            width: '100%',
                            fontSize: 13,
                            fontStyle: 'italic',
                            color: textSecondary,
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            outline: 'none',
                            resize: 'none',
                            overflow: 'hidden',
                            minHeight: 20,
                            fontFamily: 'inherit',
                        }}
                    />
                </div>
            )}
            {block.type === 'divider' && (
                <div style={{
                    height: 1,
                    backgroundColor: borderColor,
                }} />
            )}
            {block.type === 'checklist' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(block.items || []).map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                                onClick={() => toggleColumnChecklistItem(boardId, columnId, block.id, item.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                }}
                            >
                                {item.checked ? (
                                    <CheckCircle2 size={16} color="#10b981" />
                                ) : (
                                    <Circle size={16} color={textMuted} />
                                )}
                            </button>
                            <span style={{
                                fontSize: 13,
                                color: item.checked ? textMuted : textPrimary,
                                textDecoration: item.checked ? 'line-through' : 'none',
                            }}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                    <input
                        type="text"
                        placeholder="Add item..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                addColumnChecklistItem(boardId, columnId, block.id, (e.target as HTMLInputElement).value.trim());
                                (e.target as HTMLInputElement).value = '';
                            }
                        }}
                        style={{
                            fontSize: 12,
                            color: textMuted,
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '4px 0 4px 24px',
                            outline: 'none',
                        }}
                    />
                </div>
            )}
        </div>
    );
}
