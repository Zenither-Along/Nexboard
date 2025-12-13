
import React, { useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { useTheme } from 'next-themes';

export default function RectangleNode({ data, selected }: NodeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [fill, setFill] = useState('#d9d9d9');

  return (
    <div className="relative group">
      {/* Resize Handles */}
      <NodeResizer 
        minWidth={50}
        minHeight={50}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />

      {/* Rectangle */}
      <div 
        className="w-full h-full"
        style={{
          backgroundColor: fill,
          minWidth: 100,
          minHeight: 100,
          borderRadius: 0,
          boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
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
