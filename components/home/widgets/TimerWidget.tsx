"use client"

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TimerState {
    minutes: number;
    seconds: number;
    isActive: boolean;
    isBreak: boolean;
    sessions: number;
}

export function TimerWidget() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [timer, setTimer] = useState<TimerState>({
        minutes: 25,
        seconds: 0,
        isActive: false,
        isBreak: false,
        sessions: 0,
    });

    const [isEditingTimer, setIsEditingTimer] = useState(false);
    const [editMinutes, setEditMinutes] = useState('25');
    const [editSeconds, setEditSeconds] = useState('00');

    // Styles
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (timer.isActive) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev.seconds === 0) {
                        if (prev.minutes === 0) {
                            return {
                                ...prev,
                                isActive: false,
                                isBreak: !prev.isBreak,
                                minutes: prev.isBreak ? 25 : 5,
                                seconds: 0,
                                sessions: prev.isBreak ? prev.sessions : prev.sessions + 1,
                            };
                        }
                        return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                    }
                    return { ...prev, seconds: prev.seconds - 1 };
                });
            }, 1000);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [timer.isActive]);

    const toggleTimer = () => setTimer(prev => ({ ...prev, isActive: !prev.isActive }));
    const resetTimer = () => setTimer(prev => ({ ...prev, isActive: false, minutes: prev.isBreak ? 5 : 25, seconds: 0 }));

    const startEditingTimer = () => {
        if (timer.isActive) return;
        setEditMinutes(String(timer.minutes).padStart(2, '0'));
        setEditSeconds(String(timer.seconds).padStart(2, '0'));
        setIsEditingTimer(true);
    };

    const saveTimerEdit = () => {
        const mins = Math.max(0, Math.min(99, parseInt(editMinutes) || 0));
        const secs = Math.max(0, Math.min(59, parseInt(editSeconds) || 0));
        setTimer(prev => ({ ...prev, minutes: mins, seconds: secs }));
        setIsEditingTimer(false);
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
                gap: 8,
                marginBottom: 12,
            }}>
                <Clock size={16} color={textSecondary} strokeWidth={1.5} />
                <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
                    {timer.isBreak ? 'Break' : 'Focus'}
                </span>
                {timer.sessions > 0 && (
                    <span style={{ 
                        fontSize: 11, 
                        color: textMuted,
                        marginLeft: 'auto',
                    }}>
                        {timer.sessions} done
                    </span>
                )}
            </div>
            
            {isEditingTimer ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    marginBottom: 12,
                }}>
                    <input
                        type="text"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        onKeyDown={(e) => e.key === 'Enter' && saveTimerEdit()}
                        onBlur={saveTimerEdit}
                        autoFocus
                        style={{
                            width: 60,
                            fontSize: 42,
                            fontWeight: 300,
                            color: textPrimary,
                            textAlign: 'center',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            border: 'none',
                            borderRadius: 8,
                            outline: 'none',
                            padding: 4,
                        }}
                    />
                    <span style={{ fontSize: 42, fontWeight: 300, color: textPrimary }}>:</span>
                    <input
                        type="text"
                        value={editSeconds}
                        onChange={(e) => setEditSeconds(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        onKeyDown={(e) => e.key === 'Enter' && saveTimerEdit()}
                        onBlur={saveTimerEdit}
                        style={{
                            width: 60,
                            fontSize: 42,
                            fontWeight: 300,
                            color: textPrimary,
                            textAlign: 'center',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            border: 'none',
                            borderRadius: 8,
                            outline: 'none',
                            padding: 4,
                        }}
                    />
                </div>
            ) : (
                <div 
                    onClick={startEditingTimer}
                    style={{
                        fontSize: 42,
                        fontWeight: 300,
                        color: textPrimary,
                        textAlign: 'center',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em',
                        marginBottom: 12,
                        cursor: timer.isActive ? 'default' : 'pointer',
                        borderRadius: 8,
                        transition: 'background-color 0.15s ease',
                    }}
                    title={timer.isActive ? '' : 'Click to edit'}
                >
                    {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: timer.isBreak ? '#10b981' : '#a855f7',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    {timer.isActive ? <Pause size={14} /> : <Play size={14} />}
                    {timer.isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: hoverBg,
                        color: textSecondary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <RotateCcw size={14} />
                </button>
            </div>
        </div>
    );
}
