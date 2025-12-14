"use client"

import React, { useState, useRef, useEffect, memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

const StickyNote = memo(({ data, selected }: NodeProps) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Random yellow shade
  const [hue] = useState(() => 45 + Math.random() * 10);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: `hsl(${hue}, 95%, 75%)`,
        padding: '24px 16px 16px 16px',
        boxShadow: '4px 4px 12px rgba(0,0,0,0.15), 1px 1px 3px rgba(0,0,0,0.1)',
        position: 'relative',
        minWidth: 120,
        minHeight: 100,
        boxSizing: 'border-box',
      }}
    >
      {/* Resize Handles */}
      <NodeResizer 
        minWidth={120}
        minHeight={100}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />

      {/* Folded Corner Effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 24px 24px 0',
          borderColor: `transparent hsl(${hue}, 85%, 65%) transparent transparent`,
        }}
      />

      {/* Paper Texture */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.2,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something..."
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: "'Caveat', 'Segoe Script', cursive",
          fontSize: 18,
          lineHeight: 1.4,
          color: '#333',
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{
          width: 8,
          height: 8,
          backgroundColor: '#3b82f6',
          border: 'none',
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{
          width: 8,
          height: 8,
          backgroundColor: '#3b82f6',
          border: 'none',
        }}
      />
    </div>
  );
});

StickyNote.displayName = 'StickyNote';
export default StickyNote;
