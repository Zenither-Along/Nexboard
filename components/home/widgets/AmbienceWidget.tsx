"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { CloudRain, Waves, TreePine, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from 'next-themes';

// Sound configuration - 3 reliable sounds
const SOUNDS = [
    { 
        id: 'rain', 
        url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112ce99.mp3',
        icon: CloudRain, 
        label: 'Rain', 
        color: '#06b6d4' 
    },
    { 
        id: 'ocean', 
        url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3',
        icon: Waves, 
        label: 'Ocean', 
        color: '#3b82f6' 
    },
    { 
        id: 'forest', 
        url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3',
        icon: TreePine, 
        label: 'Forest', 
        color: '#22c55e' 
    },
];

export function AmbienceWidget() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    const [volumes, setVolumes] = useState<Record<string, number>>({
        rain: 0,
        ocean: 0,
        forest: 0,
    });
    
    const [muted, setMuted] = useState<Record<string, boolean>>({
        rain: false,
        ocean: false,
        forest: false,
    });
    
    const audiosRef = useRef<Record<string, HTMLAudioElement | null>>({});
    
    // Create audio elements once
    useEffect(() => {
        SOUNDS.forEach(sound => {
            const audio = new Audio(sound.url);
            audio.loop = true;
            audio.volume = 0;
            audiosRef.current[sound.id] = audio;
        });
        
        return () => {
            Object.values(audiosRef.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });
        };
    }, []);
    
    // Handle volume and playback
    const updateAudio = useCallback((id: string, volume: number, isMuted: boolean) => {
        const audio = audiosRef.current[id];
        if (!audio) return;
        
        const effectiveVolume = isMuted ? 0 : volume / 100;
        audio.volume = effectiveVolume;
        
        if (volume > 0 && !isMuted) {
            if (audio.paused) {
                audio.play().catch(() => {});
            }
        } else {
            audio.pause();
        }
    }, []);
    
    // Update audio when state changes
    useEffect(() => {
        SOUNDS.forEach(sound => {
            updateAudio(sound.id, volumes[sound.id], muted[sound.id]);
        });
    }, [volumes, muted, updateAudio]);
    
    const handleVolumeChange = (id: string, value: number) => {
        setVolumes(prev => ({ ...prev, [id]: value }));
    };
    
    const toggleMute = (id: string) => {
        setMuted(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const stopAll = () => {
        setVolumes({ rain: 0, ocean: 0, forest: 0 });
        setMuted({ rain: false, ocean: false, forest: false });
    };

    // Styles
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const textMuted = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

    const hasAnySound = Object.values(volumes).some(v => v > 0);

    return (
        <div style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles size={16} color={textSecondary} strokeWidth={1.5} />
                <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
                    Ambience
                </span>
            </div>

            {SOUNDS.map(({ id, icon: Icon, label, color }) => {
                const volume = volumes[id];
                const isMuted = muted[id];
                const isActive = volume > 0 && !isMuted;

                return (
                    <div key={id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon size={14} color={isActive ? color : textMuted} strokeWidth={1.5} />
                                <span style={{ fontSize: 12, color: isActive ? textPrimary : textMuted }}>
                                    {label}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 10, color: textMuted }}>{volume}%</span>
                                <button
                                    onClick={() => toggleMute(id)}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 4,
                                        border: 'none',
                                        backgroundColor: isMuted ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                        color: isMuted ? '#ef4444' : textMuted,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                </button>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => handleVolumeChange(id, Number(e.target.value))}
                            style={{
                                width: '100%',
                                height: 4,
                                borderRadius: 2,
                                appearance: 'none',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                cursor: 'pointer',
                                accentColor: isActive ? color : textMuted,
                                opacity: isMuted ? 0.5 : 1,
                            }}
                        />
                    </div>
                );
            })}

            {hasAnySound && (
                <button
                    onClick={stopAll}
                    style={{
                        width: '100%',
                        marginTop: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        color: textSecondary,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 500,
                    }}
                >
                    Stop All
                </button>
            )}
        </div>
    );
}
