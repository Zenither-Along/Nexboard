
import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { useTheme } from 'next-themes';

export default function FrameNode({ selected }: NodeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <>
      {/* Resize Handles - NodeResizer handles all sizing */}
      <NodeResizer 
        minWidth={50}
        minHeight={50}
        isVisible={selected}
        keepAspectRatio={false}
        shouldResize={() => true}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />

      {/* Frame Content - fills entire node */}
      <div 
        className="w-full h-full relative"
        style={{
          backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
          borderRadius: 4,
          boxShadow: selected 
            ? '0 0 0 2px #3b82f6' 
            : isDark 
              ? '0 1px 3px rgba(0,0,0,0.4)' 
              : '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
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
    </>
  );
}
