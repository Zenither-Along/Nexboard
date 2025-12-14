"use client"

import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Volume2, VolumeX, Cloud, Coffee, Waves } from 'lucide-react';
import { audioManager } from '@/lib/audioManager';

type SoundType = 'rain' | 'cafe' | 'ocean';

// Sound URLs for the ambience node
const NODE_SOUNDS = [
  { id: 'rain', url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112ce99.mp3' },
  { id: 'cafe', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c610232c18.mp3' },
  { id: 'ocean', url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3' },
];

export default function AmbienceNode({ data }: { data: any }) {
  const [volumes, setVolumes] = useState<Record<SoundType, number>>({
    rain: 0,
    cafe: 0,
    ocean: 0,
  });

  // Initialize audio manager
  useEffect(() => {
    audioManager.initialize(NODE_SOUNDS);
  }, []);

  // Update audio when volumes change
  useEffect(() => {
    (Object.keys(volumes) as SoundType[]).forEach((sound) => {
      audioManager.updateAudio(sound, volumes[sound], false);
    });
  }, [volumes]);

  const updateVolume = (sound: SoundType, value: number) => {
    setVolumes(prev => ({ ...prev, [sound]: value }));
  };

  const icons = {
    rain: Cloud,
    cafe: Coffee,
    ocean: Waves,
  };

  return (
    <div className="bg-gradient-to-br from-cyan-600 to-blue-600 backdrop-blur-xl border-2 border-cyan-400 rounded-xl p-5 shadow-2xl w-[300px] group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white">Ambience Mixer</h3>
        <Volume2 className="w-5 h-5 text-white/80" />
      </div>
      
      <div className="space-y-3">
        {(Object.keys(volumes) as SoundType[]).map((sound) => {
          const Icon = icons[sound];
          return (
            <div key={sound} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Icon className="w-6 h-6 text-white flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={volumes[sound]}
                onChange={(e) => updateVolume(sound, Number(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${volumes[sound]}%, rgba(255,255,255,0.2) ${volumes[sound]}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <span className="text-sm w-10 text-right tabular-nums font-semibold text-white">{volumes[sound]}</span>
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-400" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-400" />
    </div>
  );
}
