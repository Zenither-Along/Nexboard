
import React, { useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { useTheme } from 'next-themes';

export default function FrameNode({ data, selected }: NodeProps) {
  const [title, setTitle] = useState(data.label || 'Frame');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="relative group">
      {/* Resize Handles */}
      <NodeResizer 
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />

      {/* Frame Label */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="absolute -top-6 left-0 bg-transparent border-none outline-none text-xs font-medium"
        style={{
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />

      {/* Frame Content */}
      <div 
        className="w-full h-full"
        style={{
          backgroundColor: '#ffffff',
          minWidth: 200,
          minHeight: 150,
          borderRadius: 2,
          boxShadow: selected 
            ? '0 0 0 2px #3b82f6' 
            : '0 1px 3px rgba(0,0,0,0.12)',
        }}
      />

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2 !h-2 !bg-blue-500 !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2 !h-2 !bg-blue-500 !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
