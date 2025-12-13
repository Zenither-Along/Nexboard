"use client"

import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { useTheme } from 'next-themes';

export default function PolaroidNode({ data, selected }: NodeProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setImageUrl(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fefefe',
        padding: '12px 12px 48px 12px',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative',
        minWidth: 150,
        minHeight: 200,
        boxSizing: 'border-box',
      }}
    >
      {/* Resize Handles */}
      <NodeResizer 
        minWidth={150}
        minHeight={200}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />

      {/* Tape Effect */}
      <div 
        style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 50,
          height: 18,
          background: 'linear-gradient(180deg, rgba(215, 200, 170, 0.9) 0%, rgba(200, 185, 155, 0.85) 100%)',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          zIndex: 10,
        }}
      />

      {/* Paper Texture Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.3,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Image Area */}
      <div 
        style={{
          width: '100%',
          height: 'calc(100% - 36px)',
          backgroundColor: '#f1f1f1',
          border: isDragging ? '2px dashed #3b82f6' : '1px solid #e5e5e5',
          overflow: 'hidden',
          position: 'relative',
        }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onPaste={handlePaste}
        tabIndex={0}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Polaroid" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div 
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <span style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', padding: '0 16px' }}>
              Drop image, paste, or click
            </span>
          </div>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {/* Caption */}
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          textAlign: 'center',
          fontFamily: "'Caveat', 'Segoe Script', cursive",
          fontSize: 16,
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
}
