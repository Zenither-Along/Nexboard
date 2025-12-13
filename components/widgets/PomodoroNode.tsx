"use client"

import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroNode({ data }: { data: any }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  const total = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((total - seconds) / total) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Auto-switch modes
      if (mode === 'focus') {
        setMode('break');
        setSeconds(5 * 60);
      } else {
        setMode('focus');
        setSeconds(25 * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, mode]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 backdrop-blur-xl border-2 border-purple-400 rounded-full p-6 shadow-2xl w-[240px] h-[240px] flex items-center justify-center relative group">
      {/* Circular Progress */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="120"
          cy="120"
          r="105"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-white/20"
        />
        <circle
          cx="120"
          cy="120"
          r="105"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 105}`}
          strokeDashoffset={`${2 * Math.PI * 105 * (1 - progress / 100)}`}
          className="text-white transition-all duration-1000"
          strokeLinecap="round"
        />
      </svg>

      <div className="text-center z-10 text-white">
        <h3 className="text-4xl font-bold tabular-nums mb-1">
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </h3>
        <p className="text-sm font-medium opacity-90 capitalize mb-3">{mode}</p>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={toggle}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all hover:scale-110"
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={reset}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all hover:scale-110"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-400" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-400" />
    </div>
  );
}
