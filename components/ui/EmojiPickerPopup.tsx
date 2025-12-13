"use client"

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';

interface EmojiPickerPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (emoji: string) => void;
}

export function EmojiPickerPopup({ isOpen, onClose, onSelect }: EmojiPickerPopupProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Wait for client-side mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onSelect(emojiData.emoji);
        onClose();
    };

    // Use portal to render at root level
    return createPortal(
        <>
            {/* Backdrop - covers entire screen */}
            <div 
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 9998,
                    cursor: 'pointer',
                }}
            />

            {/* Emoji Picker - Centered Modal */}
            <div 
                ref={containerRef}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                }}
            >
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={isDark ? Theme.DARK : Theme.LIGHT}
                    width={350}
                    height={450}
                    searchPlaceHolder="Search emoji..."
                    lazyLoadEmojis={true}
                    skinTonesDisabled
                />
            </div>
        </>,
        document.body
    );
}
