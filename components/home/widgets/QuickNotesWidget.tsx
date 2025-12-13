"use client"

import { useState, useEffect, useRef } from 'react';
import { StickyNote, Plus, X, CheckCircle2, Circle } from 'lucide-react';
import { useTheme } from 'next-themes';

interface QuickNote {
    id: string;
    text: string;
    done: boolean;
}

export function QuickNotesWidget() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [notes, setNotes] = useState<QuickNote[]>([
        { id: '1', text: 'Review design mockups', done: false },
        { id: '2', text: 'Send weekly report', done: true },
    ]);
    const [newNote, setNewNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const noteInputRef = useRef<HTMLDivElement>(null);

    // Close input on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (noteInputRef.current && !noteInputRef.current.contains(e.target as Node)) {
                setShowNoteInput(false);
                setNewNote('');
            }
        };
        if (showNoteInput) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNoteInput]);

    // Styles
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

    const addNote = () => {
        if (newNote.trim()) {
            setNotes([...notes, { id: Date.now().toString(), text: newNote.trim(), done: false }]);
            setNewNote('');
            setShowNoteInput(false);
        }
    };

    const toggleNote = (id: string) => {
        setNotes(notes.map(n => n.id === id ? { ...n, done: !n.done } : n));
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 16,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StickyNote size={16} color={textSecondary} strokeWidth={1.5} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
                        Quick Notes
                    </span>
                </div>
                <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
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
            </div>

            {/* Add Note Input */}
            {showNoteInput && (
                <div ref={noteInputRef} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input
                        type="text"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addNote()}
                        placeholder="Add a note..."
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '8px 10px',
                            fontSize: 12,
                            borderRadius: 6,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                            color: textPrimary,
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={addNote}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: '#a855f7',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 500,
                        }}
                    >
                        Add
                    </button>
                </div>
            )}

            {/* Notes List */}
            <div>
                {notes.map(note => (
                    <div
                        key={note.id}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            padding: '8px 0',
                            borderBottom: `1px solid ${borderColor}`,
                        }}
                    >
                        <button
                            onClick={() => toggleNote(note.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                marginTop: 2,
                            }}
                        >
                            {note.done ? (
                                <CheckCircle2 size={16} color="#10b981" />
                            ) : (
                                <Circle size={16} color={textMuted} />
                            )}
                        </button>
                        <span style={{
                            flex: 1,
                            fontSize: 12,
                            color: note.done ? textMuted : textPrimary,
                            textDecoration: note.done ? 'line-through' : 'none',
                            lineHeight: 1.4,
                        }}>
                            {note.text}
                        </span>
                        <button
                            onClick={() => deleteNote(note.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 2,
                                cursor: 'pointer',
                                opacity: 0.4,
                            }}
                        >
                            <X size={12} color={textSecondary} />
                        </button>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 20,
                        color: textMuted,
                        fontSize: 12,
                    }}>
                        No notes yet
                    </div>
                )}
            </div>
        </div>
    );
}
