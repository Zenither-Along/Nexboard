"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { useTheme } from 'next-themes';
import useStore from '@/store/useStore';

export default function TextNode({ id, data, selected }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const nodes = useStore((state) => state.nodes);
  const setNodes = useStore((state) => state.setNodes);

  // Get text properties from node data with defaults
  const text = data?.text || 'Type something';
  const fontSize = data?.fontSize || 16;
  const fontFamily = data?.fontFamily || 'Inter';
  const fontWeight = data?.fontWeight || 400;
  const textAlign = data?.textAlign || 'left';
  const fill = data?.fill || (isDark ? '#ffffff' : '#000000');
  const lineHeight = data?.lineHeight || 1.4;

  const updateNodeData = (key: string, value: any) => {
    setNodes(nodes.map(n => 
      n.id === id 
        ? { ...n, data: { ...n.data, [key]: value } }
        : n
    ));
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    updateNodeData('text', e.currentTarget.textContent || '');
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        minWidth: 50,
        minHeight: 24,
        boxSizing: 'border-box',
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Resize Handles */}
      <NodeResizer 
        minWidth={50}
        minHeight={24}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />

      {/* Text Content */}
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') {
            setIsEditing(false);
            textRef.current?.blur();
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          padding: '4px 8px',
          fontSize: `${fontSize}px`,
          fontFamily: `'${fontFamily}', system-ui, sans-serif`,
          fontWeight: fontWeight,
          textAlign: textAlign as any,
          color: fill,
          lineHeight: lineHeight,
          cursor: isEditing ? 'text' : 'default',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{
          width: 8,
          height: 8,
          backgroundColor: '#3b82f6',
          border: 'none',
          opacity: 0,
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
          opacity: 0,
        }}
      />
    </div>
  );
}
